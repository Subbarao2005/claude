const express = require('express');
const router = express.Router();
const { 
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.post('/', verifyToken, placeOrder);
router.get('/my-orders', verifyToken, getUserOrders);
router.get('/admin/all', verifyToken, isAdmin, getAllOrders);
router.get('/admin/stats', verifyToken, isAdmin, getOrderStats);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
