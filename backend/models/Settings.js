const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  deliveryDays: {
    type: Number,
    required: true,
    default: 5,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 1000,
  },
  codFee: {
    type: Number,
    required: true,
    default: 50,
  },
  gstPercentage: {
    type: Number,
    required: true,
    default: 18,
  },
  gstThreshold: {
    type: Number,
    required: true,
    default: 1000,
  }
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
