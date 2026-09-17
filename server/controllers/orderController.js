import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { notifyNewOrder, notifyOrderStatus, notifyProductStock } from '../services/notify.js';

// @desc    Create a new order with single-vendor validation and atomic stock locking
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      clientOrderId,
      vendorId: clientVendorId,
      items,
      address,
      paymentMethod = 'COD',
      customerName,
      customerPhone
    } = req.body;

    // 1. Check idempotency if clientOrderId is provided
    if (clientOrderId) {
      const existingOrder = await Order.findOne({ clientOrderId })
        .populate('vendor', 'storeName phone address isOpen')
        .populate('customer', 'name phone');
      if (existingOrder) {
        return res.json({ success: true, order: existingOrder, isExisting: true });
      }
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        code: 'EMPTY_CART',
        message: 'Cart is empty. Please add items before placing order.'
      });
    }

    // 2. Resolve customer & Enforce Server Hard Gate (FLOW 3)
    const customerId = req.user?.id || req.user?._id;
    if (!customerId) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required to place an order.'
      });
    }

    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User account not found.'
      });
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'USER_BLOCKED',
        message: 'Your account is blocked. Please contact support.'
      });
    }

    // 🔴 SPOOFING GUARD: Prevent submitting an order on behalf of another user
    if (req.body.userId && req.body.userId.toString() !== customerId.toString()) {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'FORBIDDEN',
        message: 'You cannot place an order on behalf of another user.'
      });
    }
    if (req.body.customerId && req.body.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'FORBIDDEN',
        message: 'You cannot place an order on behalf of another customer.'
      });
    }

    // 3. Fetch all products from DB for single-vendor validation & real price calculation
    const productIds = items.map((it) => it.productId || it.product || it._id);

    // 🔴 STRICT OBJECTID GUARD: Never let CastError reach the client as a 500
    for (const pId of productIds) {
      if (!pId || !mongoose.isValidObjectId(pId)) {
        return res.status(400).json({
          ok: false,
          success: false,
          code: 'INVALID_PRODUCT_ID',
          message: `Invalid product ID format: "${pId}". Expected a 24-character hexadecimal ObjectId.`,
          invalidId: pId
        });
      }
    }

    const dbProducts = await Product.find({ _id: { $in: productIds } }).populate('vendor');

    if (dbProducts.length !== items.length) {
      return res.status(400).json({
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Some products in your cart are no longer available.'
      });
    }

    // 4. 🔴 STRICT RULE: Single-Vendor Cart Enforcement
    const vendorIdsInCart = new Set(dbProducts.map((p) => p.vendor._id.toString()));
    if (vendorIdsInCart.size > 1) {
      return res.status(400).json({
        success: false,
        code: 'MULTI_VENDOR_CART',
        message: 'Cart can only contain items from one store at a time. Please clear cart to order from a different store.'
      });
    }

    const singleVendorId = Array.from(vendorIdsInCart)[0];
    const vendorDoc = dbProducts[0].vendor;

    // 5. Check if vendor is open
    if (!vendorDoc.isOpen) {
      return res.status(400).json({
        success: false,
        code: 'VENDOR_CLOSED',
        message: `${vendorDoc.storeName} is currently closed and not accepting new orders.`
      });
    }

    // 6. Verify stock availability and recalculate line totals
    const orderItems = [];
    let itemsTotal = 0;

    for (const item of items) {
      const prodId = (item.productId || item.product || item._id).toString();
      const dbProd = dbProducts.find((p) => p._id.toString() === prodId);
      const qty = Math.max(1, parseInt(item.qty || 1, 10));

      if (dbProd.stockQty < qty) {
        return res.status(400).json({
          success: false,
          code: 'OUT_OF_STOCK',
          message: `Only ${dbProd.stockQty} unit(s) of "${dbProd.name}" remaining in stock.`
        });
      }

      const lineTotal = dbProd.price * qty;
      itemsTotal += lineTotal;

      orderItems.push({
        product: dbProd._id,
        name: dbProd.name,
        image: dbProd.image || '',
        unit: dbProd.unit || 'unit',
        price: dbProd.price,
        qty,
        lineTotal
      });
    }

    // 7. Check minimum order value
    if (itemsTotal < (vendorDoc.minOrderValue || 0)) {
      return res.status(400).json({
        success: false,
        code: 'MIN_ORDER_NOT_MET',
        message: `Minimum order value for ${vendorDoc.storeName} is ₹${vendorDoc.minOrderValue}. Current cart items total is ₹${itemsTotal}.`
      });
    }

    // 8. Calculate bill breakdown
    const deliveryFee = itemsTotal >= 200 ? 0 : 25;
    const taxes = vendorDoc.storeType === 'HOME_CHEF' ? Math.round(itemsTotal * 0.05) : 0;
    const discount = 0;
    const grandTotal = itemsTotal + deliveryFee + taxes - discount;

    // 9. 🔒 ACID-Compliant Atomic Stock Deduction with Conditional Guard & Rollback
    const successfullyDeducted = [];
    let stockFailure = null;

    for (const it of orderItems) {
      // Atomic conditional update: only decrement if stockQty >= it.qty
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: it.product, stockQty: { $gte: it.qty } },
        { $inc: { stockQty: -it.qty } },
        { new: true }
      );

      if (!updatedProduct) {
        stockFailure = it;
        break;
      }

      // If stock reached 0, atomically flag out of stock
      if (updatedProduct.stockQty <= 0) {
        await Product.findByIdAndUpdate(it.product, { inStock: false, stockQty: 0 });
        updatedProduct.inStock = false;
        updatedProduct.stockQty = 0;
      }

      // Broadcast real-time stock update to all connected customers and partner app
      notifyProductStock(updatedProduct);

      successfullyDeducted.push({ product: it.product, qty: it.qty, name: it.name });
    }

    // If any item lacked stock during atomic execution, rollback all previously deducted items
    if (stockFailure) {
      for (const item of successfullyDeducted) {
        const restored = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stockQty: item.qty }, inStock: true },
          { new: true }
        );
        if (restored) notifyProductStock(restored);
      }
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_STOCK',
        message: `Insufficient stock for "${stockFailure.name}". Another customer may have just placed an order. Please update cart.`
      });
    }

    // 10. Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const deliveryAddress = {
      name: address?.name || customerName || 'Rajesh Kumar',
      phone: address?.phone || customerPhone || '9876543210',
      line1: address?.line1 || 'Flat 302, Green Avenue, Model Town',
      city: address?.city || 'Ludhiana',
      pincode: address?.pincode || '141001'
    };

    const newOrder = new Order({
      orderNumber,
      clientOrderId: clientOrderId || `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      customer: customerId,
      vendor: singleVendorId,
      items: orderItems,
      pricing: {
        itemsTotal,
        deliveryFee,
        taxes,
        discount,
        grandTotal
      },
      payment: {
        method: paymentMethod.toUpperCase(),
        status: paymentMethod.toUpperCase() === 'COD' ? 'PENDING' : 'PAID'
      },
      address: deliveryAddress,
      status: 'NEW_ORDER',
      statusHistory: [
        {
          status: 'NEW_ORDER',
          at: new Date(),
          by: 'CUSTOMER'
        }
      ]
    });

    let savedOrder;
    try {
      savedOrder = await newOrder.save();
    } catch (saveErr) {
      // Rollback deducted stock if order creation in DB fails (ACID Consistency)
      for (const item of successfullyDeducted) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQty: item.qty },
          inStock: true
        });
      }
      throw saveErr;
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('vendor', 'storeName phone address isOpen')
      .populate('customer', 'name phone');

    // 11. 🔴 Real-time Notification Trigger: notify vendor instantly
    notifyNewOrder(populatedOrder);

    // Update vendor total order count
    await Vendor.findByIdAndUpdate(singleVendorId, { $inc: { totalOrders: 1 } });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      code: 'ORDER_CREATION_FAILED',
      message: error.message || 'Failed to create order'
    });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('vendor', 'storeName phone address isOpen rating')
      .populate('customer', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 🔴 HARD OWNERSHIP CHECK (FLOW 3):
    // Order can only be viewed by the customer who placed it, the vendor who fulfills it, or an admin/rider.
    const requesterId = (req.user?.id || req.user?._id)?.toString();
    const requesterRole = req.user?.role;
    const requesterVendorId = req.user?.vendorId?.toString();

    const orderCustomerId = (order.customer?._id || order.customer)?.toString();
    const orderVendorId = (order.vendor?._id || order.vendor)?.toString();

    const isCustomerOwner = requesterId && orderCustomerId === requesterId;
    const isVendorOwner =
      (requesterVendorId && orderVendorId === requesterVendorId) ||
      (requesterId && orderVendorId === requesterId);
    const isAdminOrRider = requesterRole === 'ADMIN' || requesterRole === 'RIDER';

    if (!isCustomerOwner && !isVendorOwner && !isAdminOrRider) {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this order.'
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/customer/my
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const orders = await Order.find({ customer: customerId })
      .populate('vendor', 'storeName phone logo address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/:vendorId
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.params.vendorId || req.user?.vendorId || req.user?.id;
    const orders = await Order.find({ vendor: vendorId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Get delivery rider orders
// @route   GET /api/orders/delivery/pending
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['READY_FOR_RIDER', 'OUT_FOR_DELIVERY'] }
    })
      .populate('vendor', 'storeName address phone')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Update Order Status with state machine & stock rollback
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const allowedStatuses = [
      'NEW_ORDER',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_RIDER',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REJECTED'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: `Invalid order status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if already in terminal state
    if (['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        code: 'ORDER_FINALIZED',
        message: `Order is already ${order.status} and cannot be altered.`
      });
    }

    // Rollback stock if cancelled or rejected
    if (['CANCELLED', 'REJECTED'].includes(status) && !['CANCELLED', 'REJECTED'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQty: item.qty },
          inStock: true
        });
      }
    }

    order.status = status;
    if (rejectionReason) order.rejectionReason = rejectionReason;

    order.statusHistory.push({
      status,
      at: new Date(),
      by: req.user?.role || 'VENDOR'
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('vendor', 'storeName phone address isOpen')
      .populate('customer', 'name phone');

    // 🔴 Notify real-time status change to customer & vendor
    notifyOrderStatus(populatedOrder);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server Error updating order status' });
  }
};
