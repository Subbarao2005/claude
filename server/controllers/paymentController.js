const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: "Amount and orderId are required" });
    }

    // Convert amount to paise
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId.toString()
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in DB
    await Payment.create({
      orderId,
      userId: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ success: false, message: "Missing payment verification details" });
    }

    // Verify signature
    const text = razorpayOrderId + "|" + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(text)
      .digest('hex');

    if (generatedSignature === razorpaySignature) {
      // Payment is successful
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { 
          status: "successful", 
          razorpayPaymentId, 
          razorpaySignature 
        }
      );

      await Order.findByIdAndUpdate(orderId, { paymentStatus: "successful" });

      return res.status(200).json({ success: true, message: "Payment verified" });
    } else {
      // Payment failed
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: "failed" });
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });

      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payment/order/:orderId
const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Check permissions
    if (req.user.role !== "admin" && payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getPaymentByOrder
};
