import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Vendor from '../models/Vendor.js';

// @desc    Get all active products with filters and search
// @route   GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const { category, vendor, search, isVeg, inStockOnly } = req.query;
    const filter = { isActive: true };

    // Search query
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Category filter (support ObjectId or slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) filter.category = catDoc._id;
      }
    }

    // Vendor filter
    if (vendor && vendor !== 'all') {
      if (vendor.match(/^[0-9a-fA-F]{24}$/)) {
        filter.vendor = vendor;
      }
    }

    if (isVeg !== undefined) {
      filter.isVeg = isVeg === 'true';
    }

    if (inStockOnly === 'true') {
      filter.inStock = true;
      filter.stockQty = { $gt: 0 };
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug icon type')
      .populate('vendor', 'storeName ownerName phone storeType isOpen rating')
      .sort({ inStock: -1, createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('category', 'name slug icon type')
      .populate('vendor', 'storeName ownerName phone storeType isOpen rating avgPrepTimeMins minOrderValue');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
};

// @desc    Get products by vendor ID
// @route   GET /api/products/vendor/:vendorId
export const getVendorProducts = async (req, res) => {
  try {
    let { vendorId } = req.params;

    // If 'default_vendor' or empty, find first active vendor
    if (!vendorId || vendorId === 'default_vendor' || !vendorId.match(/^[0-9a-fA-F]{24}$/)) {
      const firstVendor = await Vendor.findOne({ isActive: true });
      if (firstVendor) vendorId = firstVendor._id;
    }

    const products = await Product.find({ vendor: vendorId, isActive: true })
      .populate('category', 'name slug icon type')
      .sort({ inStock: -1, createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vendor products' });
  }
};

// @desc    Create / upload a new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      mrp,
      unit,
      stockQty,
      stock,
      image,
      isVeg = true,
      tags = []
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    // Determine vendor
    let vendorId = req.user?.vendorId || req.user?.id || req.body.vendor || req.body.partnerId;
    if (!vendorId || !vendorId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      const fallbackVendor = await Vendor.findOne({ isActive: true });
      vendorId = fallbackVendor?._id;
    }

    // Determine category ObjectId
    let categoryId = category;
    if (!categoryId || !categoryId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      let catDoc = null;
      if (category) {
        catDoc = await Category.findOne({
          $or: [{ slug: category.toString().toLowerCase() }, { name: new RegExp(category, 'i') }]
        });
      }
      if (!catDoc) {
        catDoc = await Category.findOne({ slug: 'home-thali' }) || await Category.findOne();
      }
      categoryId = catDoc?._id;
    }

    const qty = stockQty !== undefined ? Number(stockQty) : stock !== undefined ? Number(stock) : 25;

    const newProduct = new Product({
      name: name.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
      vendor: vendorId,
      category: categoryId,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price) * 1.2,
      unit: unit || '1 pc',
      stockQty: qty,
      inStock: qty > 0,
      isVeg: Boolean(isVeg),
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [name.toLowerCase()]
    });

    const savedProduct = await (await newProduct.save()).populate('category vendor');

    res.status(201).json({
      success: true,
      message: 'Product successfully added to MongoDB',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Error saving product' });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stockQty !== undefined) {
      updateData.stockQty = Number(updateData.stockQty);
      if (updateData.inStock === undefined) {
        updateData.inStock = updateData.stockQty > 0;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('category vendor');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

// @desc    Toggle product in-stock availability
// @route   PATCH /api/products/:id/stock
export const toggleProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.inStock = typeof req.body.inStock === 'boolean' ? req.body.inStock : !product.inStock;
    if (req.body.stockQty !== undefined) product.stockQty = Number(req.body.stockQty);
    if (req.body.stock !== undefined) product.stockQty = Number(req.body.stock);

    await product.save();

    res.json({
      success: true,
      message: `Product is now ${product.inStock ? 'In Stock' : 'Out of Stock'}`,
      product
    });
  } catch (error) {
    console.error('Error toggling stock:', error);
    res.status(500).json({ success: false, message: 'Error updating stock' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted from MongoDB',
      deletedProductId: id
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};
