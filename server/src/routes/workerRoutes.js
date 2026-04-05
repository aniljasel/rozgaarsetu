const express = require('express');
const {
    getWorkerProfile,
    updateWorkerProfile,
    getWorkers,
    getWorkerById,
    deleteWorkerAccount,
    uploadWorkerVerification
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getWorkers); // Public route

router.route('/profile')
    .get(protect, authorize('worker'), getWorkerProfile)
    .put(protect, authorize('worker'), updateWorkerProfile)
    .delete(protect, authorize('worker'), deleteWorkerAccount);

router.route('/verify')
    .post(protect, authorize('worker'), uploadWorkerVerification);

router.route('/:id')
    .get(getWorkerById); // Public route

module.exports = router;
