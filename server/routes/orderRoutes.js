import express from 'express';
import {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getVendorOrders,
  getDeliveryOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { optionalAuth, verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/orders', verifyToken, createOrder);
router.get('/orders/customer/my', verifyToken, getCustomerOrders);
router.get('/orders/delivery/pending', getDeliveryOrders);
router.get('/orders/vendor/:vendorId', verifyToken, getVendorOrders);
router.get('/orders/:id', verifyToken, getOrderById);
router.patch('/orders/:id/status', optionalAuth, updateOrderStatus);

export default router;
