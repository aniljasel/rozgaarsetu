const Category = require('../models/Category');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('name');
        res.status(200).json({ success: true, count: categories.length, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name, iconName } = req.body;

        let category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (category) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        category = await Category.create({
            name,
            iconName: iconName || 'Briefcase'
        });

        res.status(201).json({ success: true, category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await category.deleteOne();
        res.status(200).json({ success: true, message: 'Category removed' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory
};
