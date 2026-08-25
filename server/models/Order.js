import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    default: 'Central Hub'
  },
  items: [{
    name: String,
    qty: Number,
    price: Number
  }],
  itemsCount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'RAZORPAY'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  status: {
    type: String,
    enum: ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READY_FOR_RIDER', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'NEW_ORDER'
  },
  deliveryType: {
    type: String,
    default: 'Express Rider Dispatch'
  },
  otpRequired: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString()
  },
  vendorId: {
    type: String,
    default: 'default_vendor'
  },
  deliveryAgentId: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
