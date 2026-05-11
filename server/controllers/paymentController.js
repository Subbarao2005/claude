const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: "Amount and orderId are required" });
    }

    // Convert to Paise (Integer) - Use Math.round to prevent float issues
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${orderId.slice(-6)}`,
      payment_capture: 1
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Track payment initiation
    await Payment.create({
      orderId,
      userId: req.user.id,
      razorpayOrderId: rzpOrder.id,
      amount: Number(amount),
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ success: false, message: "Missing verification details" });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      // Update Payment Record
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "successful", razorpayPaymentId, razorpaySignature }
      );

      // Update Order Status
      await Order.findByIdAndUpdate(orderId, { 
        paymentStatus: "successful",
        status: "confirmed"
      });

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: "failed" });
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({ success: false, message: "Verification process failed" });
  }
};

// GET /api/payment/order/:orderId
exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });
    if (req.user.role !== "admin" && payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
