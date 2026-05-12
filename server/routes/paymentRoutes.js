const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentByOrder,
  handlePaymentFailure
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/verifyToken');

router.post('/create-order', verifyToken, createRazorpayOrder);
router.post('/verify', verifyToken, verifyPayment);
router.post('/failure', verifyToken, handlePaymentFailure);
router.get('/order/:orderId', verifyToken, getPaymentByOrder);

module.exports = router;
