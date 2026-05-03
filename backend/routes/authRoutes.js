const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, forgotPassword, resetPassword, toggleWishlist, addAddress } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, toggleWishlist);
router.post('/address', protect, addAddress);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
