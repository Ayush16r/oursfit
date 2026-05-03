const express = require('express');
const router = express.Router();
const { syncCart, getCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.post('/sync', protect, syncCart);
router.get('/', protect, getCart);

module.exports = router;
