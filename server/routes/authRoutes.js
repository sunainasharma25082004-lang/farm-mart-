import express from 'express';
import {
  customerLogin,
  vendorLogin,
  registerPushToken,
  getMe
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/customer/login', customerLogin);
router.post('/vendor/login', vendorLogin);
router.post('/push-token', verifyToken, registerPushToken);
router.get('/me', verifyToken, getMe);

export default router;
