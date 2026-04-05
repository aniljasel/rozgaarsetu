const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for customers and workers to see options
router.route('/').get(getCategories);

// Protected Admin-only routes
router.use(protect, authorize('admin'));
router.route('/').post(createCategory);
router.route('/:id').delete(deleteCategory);

module.exports = router;
