const express = require('express');
const router = express.Router();
const { 
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleAvailability,
  deleteProduct,
  getAllProductsAdmin
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAllProducts);
router.get('/admin/all', verifyToken, isAdmin, getAllProductsAdmin);
router.get('/:id', getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.put('/:id/toggle', verifyToken, isAdmin, toggleAvailability);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
