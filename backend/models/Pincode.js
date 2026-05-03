const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
  },
  deliveryDays: {
    type: Number,
    required: true,
    default: 5,
  },
  isDeliverable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Pincode = mongoose.model('Pincode', pincodeSchema);
module.exports = Pincode;
