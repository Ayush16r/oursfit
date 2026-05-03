const Pincode = require('../models/Pincode');

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Private/Admin
const getPincodes = async (req, res) => {
  try {
    const pincodes = await Pincode.find({});
    res.json(pincodes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a pincode
// @route   POST /api/pincodes
// @access  Private/Admin
const createPincode = async (req, res) => {
  const { pincode, deliveryDays, isDeliverable } = req.body;

  try {
    const pincodeExists = await Pincode.findOne({ pincode });

    if (pincodeExists) {
      return res.status(400).json({ message: 'Pincode already exists' });
    }

    const newPincode = await Pincode.create({
      pincode,
      deliveryDays,
      isDeliverable,
    });

    res.status(201).json(newPincode);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
const deletePincode = async (req, res) => {
  try {
    const pincode = await Pincode.findById(req.params.id);

    if (pincode) {
      await Pincode.deleteOne({ _id: req.params.id });
      res.json({ message: 'Pincode removed' });
    } else {
      res.status(404).json({ message: 'Pincode not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check pincode delivery status
// @route   GET /api/pincodes/:pincode
// @access  Public
const checkPincode = async (req, res) => {
  try {
    const p = await Pincode.findOne({ pincode: req.params.pincode });

    if (p && p.isDeliverable) {
      res.json({ deliverable: true, days: p.deliveryDays });
    } else {
      res.json({ deliverable: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPincodes,
  createPincode,
  deletePincode,
  checkPincode,
};
