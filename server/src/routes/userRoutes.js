const express = require('express');
const { getUserProfile, updateUserProfile, deleteUserAccount, uploadUserVerification } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/profile')
    .get(protect, authorize('customer'), getUserProfile)
    .put(protect, authorize('customer'), updateUserProfile)
    .delete(protect, authorize('customer'), deleteUserAccount);

router.route('/verify')
    .post(protect, authorize('customer'), uploadUserVerification);

module.exports = router;
