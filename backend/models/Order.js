const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      size: { type: String, required: true },
      color: { type: String }, // New variant support
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    }
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }, // New
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Card',
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'delivered', 'delayed', 'cancelled', 'returned', 'refund initiated', 'refund completed'],
    default: 'pending',
  },
  
  // Advanced Shipping Logic
  trackingId: { type: String },
  courierPartner: { type: String },
  deliveryNotes: { type: String },
  estimatedDelivery: { type: Date },
  
  timeline: [
    {
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
      description: { type: String }
    }
  ],

  // Admin and Return management
  adminNotes: { type: String },
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },

  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  timeline: [{
    status: { type: String },
    date: { type: Date, default: Date.now },
    description: { type: String }
  }]
}, {
  timestamps: true,
});

// Auto-add timeline events when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (!this.timeline) this.timeline = [];
    this.timeline.push({
      status: this.status,
      date: new Date(),
      description: `Order marked as ${this.status}`
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
