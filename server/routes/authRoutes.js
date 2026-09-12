import express from 'express';
import { appLogin } from '../controllers/authController.js';

const router = express.Router();

// Common login for apps, expects { appId, password, expectedRole }
router.post('/login', appLogin);

export default router;
