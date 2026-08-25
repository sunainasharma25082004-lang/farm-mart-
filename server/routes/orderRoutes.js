import express from 'express';
import { createOrder, getVendorOrders, getDeliveryOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders/vendor/:vendorId', getVendorOrders);
router.get('/orders/delivery', getDeliveryOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
