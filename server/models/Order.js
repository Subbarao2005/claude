const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    landmark: { type: String }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, required: true } // 'admin' or 'user'
  }],
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  }
}, { timestamps: true });

// Pre-save hook to initialize status history
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: 'Pending',
      changedAt: new Date(),
      changedBy: 'user'
    }];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
