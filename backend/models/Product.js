const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [{
    type: String, // URLs of images
    required: true,
  }],
  sizes: [{
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL'],
    required: true,
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  details: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
