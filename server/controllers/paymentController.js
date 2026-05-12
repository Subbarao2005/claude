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
    console.log(`[PAYMENT_INIT] Processing order: ${orderId} for amount: ${amount}`);

    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: "Amount and orderId are required" });
    }

    // 1. Convert to Paise (Integer) - Use Math.round to prevent float precision issues
    const amountInPaise = Math.round(Number(amount) * 100);

    // 2. Razorpay Order Options with Metadata
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${orderId.slice(-8)}_${Date.now()}`,
      notes: {
        orderId: orderId,
        platform: "Melcho Desserts"
      }
    };

    const rzpOrder = await razorpay.orders.create(options);
    console.log(`[RAZORPAY_ORDER_CREATED] RZP_ID: ${rzpOrder.id}`);

    // 3. Track initiation in DB
    await Payment.findOneAndUpdate(
      { orderId },
      {
        userId: req.user.id,
        razorpayOrderId: rzpOrder.id,
        amount: Number(amount),
        status: "pending"
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("[PAYMENT_ERROR] Order Creation Failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    console.log(`[PAYMENT_VERIFY] Verifying Payment: ${razorpayPaymentId} for Order: ${orderId}`);

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ success: false, message: "Incomplete verification details" });
    }

    // 1. Reconstruct Signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      console.log(`[PAYMENT_SUCCESS] Verification Passed for ${razorpayPaymentId}`);

      // 2. Atomic Updates
      await Promise.all([
        Payment.findOneAndUpdate(
          { razorpayOrderId },
          { 
            status: "successful", 
            razorpayPaymentId, 
            razorpaySignature,
            updatedAt: Date.now()
          }
        ),
        Order.findByIdAndUpdate(orderId, { 
          paymentStatus: "successful",
          status: "confirmed",
          updatedAt: Date.now()
        })
      ]);

      return res.status(200).json({ success: true, message: "Payment verified and order confirmed" });
    } else {
      console.error(`[PAYMENT_FAILURE] Invalid Signature for Order: ${orderId}`);
      await Payment.findOneAndUpdate({ razorpayOrderId }, { status: "failed" });
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("[PAYMENT_ERROR] Verification Exception:", error);
    return res.status(500).json({ success: false, message: "Internal server error during verification" });
  }
};

// POST /api/payment/failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, errorData } = req.body;
    console.warn(`[PAYMENT_DECLINED] Order: ${orderId} | Reason: ${errorData?.description || 'Unknown'}`);
    
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpayOrderId || { $exists: true } },
      { status: "failed", notes: JSON.stringify(errorData) }
    );
    
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    
    res.status(200).json({ success: true, message: "Failure recorded" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
