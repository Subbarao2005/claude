const express = require('express');
const router = express.Router();
const { 
  createRazorpayOrder, 
  verifyPayment 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/create-order', verifyToken, createRazorpayOrder);
router.post('/verify', verifyToken, verifyPayment);

module.exports = router;
