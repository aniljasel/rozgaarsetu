const express = require('express');
const {
    approveWorker,
    approveUser,
    getAdminStats,
    getAllUsers,
    getAllWorkers,
    getAllJobs,
    updatePassword,
    getSettings,
    updateSettings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin')); // Apply to all routes below

router.route('/stats').get(getAdminStats);
router.route('/users').get(getAllUsers);
router.route('/workers').get(getAllWorkers);
router.route('/jobs').get(getAllJobs);
router.route('/workers/:id/approve').put(approveWorker);
router.route('/users/:id/approve').put(approveUser);
router.route('/password').put(updatePassword);
router.route('/settings').get(getSettings).put(updateSettings);

module.exports = router;
