const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, getAllProductsAdmin);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
