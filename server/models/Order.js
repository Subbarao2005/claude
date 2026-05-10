const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Accepted',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Rejected',
      'Cancelled',
    ],
    default: 'Pending',
  },
  address: {
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    pincode:  { type: String, required: true },
    landmark: { type: String, default: '' },
    phone:    { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
