const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createFeedback, getWorkerFeedbacks, getMyFeedbacks } = require('../controllers/feedbackController');

router.post('/', protect, createFeedback);
router.get('/my', protect, getMyFeedbacks);          // Customer: get my reviews
router.get('/worker/:workerId', protect, getWorkerFeedbacks);

module.exports = router;
