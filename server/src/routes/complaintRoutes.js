const express = require('express');
const {
    createComplaint,
    getComplaints,
    updateComplaint,
    getMyComplaints
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, authorize('customer', 'worker'), createComplaint)
    .get(protect, authorize('admin'), getComplaints);

router.route('/my')
    .get(protect, authorize('customer', 'worker'), getMyComplaints);

router.route('/:id')
    .put(protect, authorize('admin'), updateComplaint);

module.exports = router;
