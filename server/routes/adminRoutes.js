import express from 'express';
import { adminLogin, createSubAdmin, getAdminData, updateApplicationStatus } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/create-subadmin', createSubAdmin);
router.get('/data', getAdminData);
router.post('/update-status', updateApplicationStatus);

export default router;
