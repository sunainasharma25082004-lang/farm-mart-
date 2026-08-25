import Order from '../models/Order.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { orderId, customerName, customerPhone, deliveryAddress, items, totalAmount, paymentMethod, paymentStatus } = req.body;
    
    const itemsCount = items ? items.reduce((acc, item) => acc + (item.qty || 1), 0) : 0;
    
    const order = new Order({
      orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      itemsCount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: 'NEW_ORDER'
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Get all orders for a specific vendor
export const getVendorOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const orders = await Order.find({ vendorId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Get all orders assigned to delivery (or ready for pickup)
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['READY_FOR_RIDER', 'ASSIGNED', 'OUT_FOR_DELIVERY'] }
    }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};
