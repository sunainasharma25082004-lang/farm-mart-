import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getVendorProducts, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

router.post('/products', createProduct);
router.get('/products', getProducts);
router.get('/products/vendor/:vendorId', getVendorProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
