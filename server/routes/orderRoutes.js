const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

// User routes
router.post('/', verifyToken, placeOrder);
router.get('/my-orders', verifyToken, getUserOrders);
router.put('/:id/cancel', verifyToken, cancelOrder);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

// Shared route (must be below specific paths to avoid collisions)
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
