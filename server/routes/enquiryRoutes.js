import express from 'express';
import { submitEnquiry, getEnquiries, approveEnquiry } from '../controllers/enquiryController.js';

const router = express.Router();

router.post('/', submitEnquiry);
router.get('/admin', getEnquiries);
router.post('/admin/:id/approve', approveEnquiry);

export default router;
