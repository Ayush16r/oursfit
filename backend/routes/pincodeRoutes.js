const express = require('express');
const router = express.Router();
const {
  getPincodes,
  createPincode,
  deletePincode,
  checkPincode,
} = require('../controllers/pincodeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getPincodes).post(protect, admin, createPincode);
router.route('/:id').delete(protect, admin, deletePincode);
router.get('/:pincode', checkPincode);

module.exports = router;
