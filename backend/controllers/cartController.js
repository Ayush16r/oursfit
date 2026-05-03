const User = require('../models/User');

// @desc    Sync local cart to DB
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // req.body.cart should be an array of { product, quantity, size }
    user.cart = req.body.cart;
    await user.save();

    res.json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("syncCart Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  syncCart,
  getCart
};
