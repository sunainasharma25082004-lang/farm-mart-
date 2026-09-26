import mongoose from 'mongoose';
import { validCoordinates, canAccessOrder, canTransition, distanceKm, storePoint } from '../utils/deliveryPolicy.js';
import Rider from '../models/Rider.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { notifyNewOrder, notifyOrderStatus, notifyProductStock } from '../services/notify.js';
import { dispatchOrderToRiders } from '../services/riderAssignmentService.js';

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
      const existingOrder = await Order.findOne({ clientOrderId, customer: req.user.id || req.user._id })
        .populate('vendor', 'storeName phone address location isOpen')
        .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating');
      if (existingOrder) {
        return res.json({ success: true, order: existingOrder, isExisting: true });
      }
    }

    if (!Array.isArray(items) || !items.length) {
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

    if (!validCoordinates(address?.lat, address?.lng) || !address?.line1?.trim() || !address?.name?.trim() || !/^[+\d\s-]{10,16}$/.test(address?.phone || '')) {
      return res.status(400).json({success:false,code:'DELIVERY_ADDRESS_REQUIRED',message:'Enter recipient, phone, address and confirm a valid delivery pin.'});
    }
    if (paymentMethod !== 'COD') {
      return res.status(400).json({success:false,code:'PAYMENT_NOT_CONFIGURED',message:'Online payment verification is not configured. Please choose Cash on Delivery.'});
    }
    if (items.some(i => !Number.isSafeInteger(i.qty ?? i.quantity ?? 1) || (i.qty ?? i.quantity ?? 1) < 1)) {
      return res.status(400).json({success:false,code:'INVALID_QUANTITY',message:'Item quantities must be positive whole numbers.'});
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
      const qty = item.qty ?? item.quantity ?? 1;

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

    // 10. Generate order number & delivery address
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const deliveryAddress = {
      name: address.name.trim(), phone: address.phone.trim(), line1: address.line1.trim(),
      city: address.city || '', pincode: address.pincode || '', lat: address.lat, lng: address.lng
    };

    // 11. 🔒 ACID-Compliant Multi-Document Atomic Transaction
    let savedOrder;
    const productsToNotify = [];
    let session = null;

    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Atomic stock deduction inside transaction
        for (const it of orderItems) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: it.product, stockQty: { $gte: it.qty } },
            { $inc: { stockQty: -it.qty } },
            { new: true, session }
          );

          if (!updatedProduct) {
            const err = new Error(`Insufficient stock for "${it.name}". Another customer may have just placed an order. Please update cart.`);
            err.code = 'INSUFFICIENT_STOCK';
            throw err;
          }

          if (updatedProduct.stockQty <= 0) {
            await Product.findByIdAndUpdate(it.product, { inStock: false, stockQty: 0 }, { session });
            updatedProduct.inStock = false;
            updatedProduct.stockQty = 0;
          }

          productsToNotify.push(updatedProduct);
        }

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

        savedOrder = await newOrder.save({ session });

        // Update vendor total order count
        await Vendor.findByIdAndUpdate(singleVendorId, { $inc: { totalOrders: 1 } }, { session });
      });
      await session.endSession();
    } catch (txErr) {
      if (session) {
        try { await session.endSession(); } catch (e) {}
      }
      if (txErr.code === 'INSUFFICIENT_STOCK') {
        return res.status(400).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: txErr.message
        });
      }
      // If transactions are not supported on non-replica set, fall back to conditional atomic updates
      if (txErr.message?.includes('Transaction numbers are only allowed')) {
        console.warn('Standalone MongoDB detected; falling back to conditional atomic decrement with compensation rollback.');
        const successfullyDeducted = [];
        let stockFailure = null;

        for (const it of orderItems) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: it.product, stockQty: { $gte: it.qty } },
            { $inc: { stockQty: -it.qty } },
            { new: true }
          );
          if (!updatedProduct) {
            stockFailure = it;
            break;
          }
          if (updatedProduct.stockQty <= 0) {
            await Product.findByIdAndUpdate(it.product, { inStock: false, stockQty: 0 });
            updatedProduct.inStock = false;
            updatedProduct.stockQty = 0;
          }
          productsToNotify.push(updatedProduct);
          successfullyDeducted.push({ product: it.product, qty: it.qty, name: it.name });
        }

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

        const newOrder = new Order({
          orderNumber,
          clientOrderId: clientOrderId || `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          customer: customerId,
          vendor: singleVendorId,
          items: orderItems,
          pricing: { itemsTotal, deliveryFee, taxes, discount, grandTotal },
          payment: {
            method: paymentMethod.toUpperCase(),
            status: paymentMethod.toUpperCase() === 'COD' ? 'PENDING' : 'PAID'
          },
          address: deliveryAddress,
          status: 'NEW_ORDER',
          statusHistory: [{ status: 'NEW_ORDER', at: new Date(), by: 'CUSTOMER' }]
        });

        try {
          savedOrder = await newOrder.save();
          await Vendor.findByIdAndUpdate(singleVendorId, { $inc: { totalOrders: 1 } });
        } catch (saveErr) {
          for (const item of successfullyDeducted) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stockQty: item.qty }, inStock: true });
          }
          throw saveErr;
        }
      } else {
        throw txErr;
      }
    }

    // Broadcast stock updates now that transaction is durable
    for (const p of productsToNotify) {
      notifyProductStock(p);
    }

    // Reset customer cart after successful order placement
    try {
      const Cart = (await import('../models/Cart.js')).default;
      await Cart.findOneAndUpdate({ user: customerId }, { items: [], vendor: null });
    } catch (cErr) {
      console.warn('Failed to clear cart after order:', cErr);
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('vendor', 'storeName phone address location isOpen')
      .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating');

    // 12. 🔴 Real-time Notification Trigger: notify vendor instantly
    notifyNewOrder(populatedOrder);

    // 13. 🔴 60-Second Auto-Accept Guarantee: Automatically accept for kitchen/farm preparation if unhandled
    const orderToAutoAcceptId = savedOrder._id;
    setTimeout(async () => {
      try {
        const accepted = await Order.findOneAndUpdate({_id:orderToAutoAcceptId,status:'NEW_ORDER'}, {
          $set:{status:'ACCEPTED'},$push:{statusHistory:{status:'ACCEPTED',at:new Date(),by:'SYSTEM_AUTO_ACCEPT'}}
        },{new:true});
        if(accepted) notifyOrderStatus(accepted);
      } catch (autoErr) {
        console.warn('Server auto-accept failed:', autoErr);
      }
    }, 60000);

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
      .populate('vendor', 'storeName phone address location isOpen rating')
      .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!canAccessOrder(req.user, order)) return res.status(403).json({success:false,code:'FORBIDDEN',message:'This order belongs to another account.'});
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/customer/my
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user?._id || req.user?.id;
    if (!customerId) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication token required to view orders'
      });
    }

    const orders = await Order.find({ customer: customerId })
      .populate('vendor', 'storeName phone logo address location isOpen')
      .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating')
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
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required to view store orders'
      });
    }

    const requestedVendorId = req.params.vendorId;
    const authenticatedVendorId = (authUser.vendorId || authUser.id || authUser._id)?.toString();

    // If requester is a vendor, strictly enforce they can only see their own store
    if (authUser.role === 'VENDOR') {
      if (requestedVendorId && requestedVendorId.toString() !== authenticatedVendorId) {
        return res.status(403).json({
          ok: false,
          success: false,
          code: 'FORBIDDEN',
          message: 'You can only view orders assigned to your own store.'
        });
      }
    } else if (authUser.role !== 'ADMIN') {
      // Customers cannot view vendor order queues
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'FORBIDDEN',
        message: 'Customers cannot view merchant store orders.'
      });
    }

    const targetVendorId = requestedVendorId || authenticatedVendorId;
    const orders = await Order.find({ vendor: targetVendorId })
      .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get delivery rider orders
// @route   GET /api/orders/delivery/pending
export const getDeliveryOrders = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user.id);
    if (!rider || rider.status !== 'ONLINE_IDLE' || Date.now()-new Date(rider.locationUpdatedAt).getTime()>120000) return res.json({success:true,orders:[]});
    const candidates = await Order.find({ status:'READY_FOR_RIDER', rider:null })
      .select('-pickupOtp -deliveryOtp -deliveryRoute -address.phone -customer')
      .populate('vendor','storeName address phone').sort({createdAt:1}).limit(100);
    const point={lat:rider.currentLocation?.coordinates?.[1],lng:rider.currentLocation?.coordinates?.[0]};
    const orders=candidates.filter(o=>distanceKm(point,storePoint(o.vendor))<=8);
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

    if (!canTransition(req.user,order,status)) return res.status(403).json({success:false,code:'INVALID_TRANSITION',message:'This account cannot perform this order transition. Delivery requires assigned rider OTP verification.'});
    const session=await mongoose.startSession();
    try {
      await session.withTransaction(async()=>{
        const updated=await Order.findOneAndUpdate({_id:id,status:order.status}, {
          $set:{status,rejectionReason:rejectionReason || ''},
          $push:{statusHistory:{status,at:new Date(),by:req.user.role}}
        },{new:true,session});
        if(!updated) throw new Error('Order changed. Refresh before trying again.');
        if(['CANCELLED','REJECTED'].includes(status)) {
          for(const item of order.items) await Product.findByIdAndUpdate(item.product,{$inc:{stockQty:item.qty},$set:{inStock:true}},{session});
        }
      });
    } finally {await session.endSession();}
    if(['CANCELLED','REJECTED'].includes(status)) {
      for(const item of order.items) {const product=await Product.findById(item.product);if(product)notifyProductStock(product);}
    }
    const populatedOrder = await Order.findById(order._id)
      .populate('vendor', 'storeName phone address location isOpen')
      .populate('customer', 'name phone').populate('rider','name phone vehicleType vehicleNumber rating');

    // 🔴 Notify real-time status change to customer & vendor
    notifyOrderStatus(populatedOrder);

    // If order is ready for rider pickup, trigger auto-assignment dispatcher
    if (status === 'READY_FOR_RIDER') {
      dispatchOrderToRiders(populatedOrder).catch((err) =>
        console.error('Error dispatching order to riders:', err)
      );
    }

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
