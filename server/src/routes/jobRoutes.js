const express = require('express');
const {
    createJob,
    getMyJobs,
    updateJobStatus,
    updateJobPayment
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, authorize('customer'), createJob)
    .get(protect, getMyJobs); // Common for customer and worker

router.route('/:id/status')
    .put(protect, authorize('customer', 'worker', 'admin'), updateJobStatus);

router.route('/:id/payment')
    .put(protect, authorize('customer', 'admin'), updateJobPayment);

module.exports = router;
