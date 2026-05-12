const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and orderId are required'
      });
    }

    // Validate orderId exists in DB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Amount MUST be in paise (multiply rupees by 100)
    const amountInPaise = Math.round(amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString(),
        userId: req.user.id
      }
    });

    // Save payment record
    const payment = await Payment.create({
      orderId,
      userId: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      status: 'pending'
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id
    });
  } catch (err) {
    console.error('Create Razorpay order error:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || 
        !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment fields are required'
      });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed' }
      );
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Signature valid — update records
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'successful'
      }
    );

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'successful',
      orderStatus: 'Pending'
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
