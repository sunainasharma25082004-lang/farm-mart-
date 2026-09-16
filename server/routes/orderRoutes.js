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

router.post('/orders', optionalAuth, createOrder);
router.get('/orders/customer/my', verifyToken, getCustomerOrders);
router.get('/orders/delivery/pending', getDeliveryOrders);
router.get('/orders/vendor/:vendorId', optionalAuth, getVendorOrders);
router.get('/orders/:id', optionalAuth, getOrderById);
router.patch('/orders/:id/status', optionalAuth, updateOrderStatus);

export default router;
