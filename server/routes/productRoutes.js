import express from 'express';
import {
  getAllProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  toggleProductStock,
  deleteProduct
} from '../controllers/productController.js';
import { optionalAuth, verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.get('/products/vendor/:vendorId', getVendorProducts);

// Vendor-protected / authenticated routes
router.post('/products', optionalAuth, createProduct);
router.put('/products/:id', optionalAuth, updateProduct);
router.patch('/products/:id/stock', optionalAuth, toggleProductStock);
router.delete('/products/:id', optionalAuth, deleteProduct);

export default router;
