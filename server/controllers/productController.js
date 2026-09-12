import Product from "../models/Product.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      service,
      price,
      unit,
      stock,
      vendorId,
      description,
      image,
      farmer,
      discount,
    } = req.body;

    const product = new Product({
      name,
      category,
      service: service || "farmart_mart",
      price,
      unit,
      stock,
      vendorId: vendorId || "default_vendor",
      description,
      image:
        image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
      farmer: farmer || "Local Partner",
      discount,
      isAvailable: true,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get all available products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get products by vendor
export const getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const products = await Product.find({ vendorId }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Update product status/details
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
