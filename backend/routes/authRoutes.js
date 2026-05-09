const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, forgotPassword, resetPassword, toggleWishlist, addAddress, getUsersAdmin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, toggleWishlist);
router.post('/address', protect, addAddress);
router.put('/resetpassword/:resettoken', resetPassword);

// Admin Routes
router.get('/', protect, admin, getUsersAdmin);
router.put('/admin/users/:id', protect, admin, require('../controllers/authController').updateUserAdmin);

module.exports = router;
