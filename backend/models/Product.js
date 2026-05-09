const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String }
});

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
  originalPrice: {
    type: Number,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String, // URLs of images, index 0 is thumbnail
    required: true,
  }],
  
  // Advanced Variants
  variants: [variantSchema],
  
  // Legacy fields (kept for backwards compatibility)
  sizes: [{
    type: String,
  }],
  stock: {
    type: Number,
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
  fabric: {
    type: String,
  },

  // SEO Meta
  seoTitle: {
    type: String,
  },
  seoDescription: {
    type: String,
  },

  // Store-Specific Flags
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  
  // Visibility & Scheduling
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'published' 
  },
  launchDate: {
    type: Date,
  }
}, {
  timestamps: true,
});

// Auto-calculate discount percentage and total stock before saving
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discountPercentage = 0;
  }
  
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((total, v) => total + (v.stock || 0), 0);
  }
  
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
