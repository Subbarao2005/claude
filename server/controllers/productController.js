const Product = require('../models/Product');
const mongoose = require('mongoose');

// ─── Get All Products (Customer View) ─────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ availability: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
      products: [],
    });
  }
};

// ─── Get All Products (Admin View - Including Unavailable) ───────────────
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'All products retrieved successfully',
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching admin products:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
      products: [],
    });
  }
};

// ─── Get Product By ID ───────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        product: null,
      });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        product: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      product,
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
      product: null,
    });
  }
};

// ─── Create Product (Admin Only) ────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { title, price, category, description, image, availability } = req.body;

    // Validate required fields
    if (!title || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, price, and category are required',
        product: null,
      });
    }

    // Validate price is positive number
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
        product: null,
      });
    }

    const newProduct = new Product({
      title,
      price,
      category,
      description: description || '',
      image: image || '',
      availability: availability !== undefined ? availability : true,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
      product: null,
    });
  }
};

// ─── Update Product (Admin Only) ────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        product: null,
      });
    }

    // Validate price if provided
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
        product: null,
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        product: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
      product: null,
    });
  }
};

// ─── Delete Product (Admin Only) ───────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};

module.exports = {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
