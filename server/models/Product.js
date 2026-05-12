const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Bubble Waffle',
        'Add-On',
        'The Big Hero Bread',
        'Fruitella',
        'Croissants',
        'Bun & Choco',
        'Melt-In Moments'
      ],
      message: '{VALUE} is not a supported category'
    }
  },
  availability: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ category: 1 });
productSchema.index({ availability: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
