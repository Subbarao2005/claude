const Product = require('../models/Product');
const Order = require('../models/Order');

const VALID_CATEGORIES = [
  'Bubble Waffle',
  'Add-On',
  'The Big Hero Bread',
  'Fruitella',
  'Croissants',
  'Bun & Choco',
  'Melt-In Moments'
];

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ availability: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, price, category, description, image, availability } = req.body;

    // Validations
    if (!title || title.length < 2 || title.length > 200) {
      return res.status(400).json({ success: false, message: "Title must be between 2 and 200 characters" });
    }
    if (isNaN(price) || price < 1 || price > 10000) {
      return res.status(400).json({ success: false, message: "Price must be a number between 1 and 10,000" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (description && description.length > 500) {
      return res.status(400).json({ success: false, message: "Description max 500 characters" });
    }

    const product = await Product.create({
      title,
      price: Number(price),
      category,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1964&auto=format&fit=crop',
      availability: availability !== undefined ? availability : true
    });

    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, price, category, description, image, availability } = req.body;
    
    // Validations for update
    if (title && (title.length < 2 || title.length > 200)) {
      return res.status(400).json({ success: false, message: "Title invalid length" });
    }
    if (price && (isNaN(price) || price < 1 || price > 10000)) {
      return res.status(400).json({ success: false, message: "Price invalid range" });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.availability = !product.availability;
    await product.save();

    res.status(200).json({ 
      success: true, 
      message: "Availability toggled", 
      product,
      newAvailability: product.availability 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product has any orders
    const orderCount = await Order.countDocuments({ "products.productId": productId });

    if (orderCount > 0) {
      // Soft delete
      await Product.findByIdAndUpdate(productId, { availability: false });
      return res.status(200).json({ 
        success: true, 
        message: "Product has orders, so it was hidden (soft deleted) instead of permanently removed",
        deleted: false,
        softDeleted: true
      });
    }

    // Hard delete
    const product = await Product.findByIdAndDelete(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ 
      success: true, 
      message: "Product deleted permanently", 
      deleted: true,
      softDeleted: false 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Add orderCount to each product
    const productsWithStats = await Promise.all(products.map(async (p) => {
      const orderCount = await Order.countDocuments({ "products.productId": p._id });
      return {
        ...p.toObject(),
        orderCount
      };
    }));

    res.status(200).json({ success: true, products: productsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
