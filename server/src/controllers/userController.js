const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Customer only)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.status(200).json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Customer only)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.address = req.body.address || user.address;
            user.profileImage = req.body.profileImage || user.profileImage;
            user.skills = req.body.skills || user.skills;

            const updatedUser = await user.save();
            res.status(200).json({ success: true, user: updatedUser });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private (Customer only)
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            // Validate phone number passed in request body
            const reqPhone = (req.body.phone || '').replace(/\D/g, '');
            const userPhone = (user.phone || '').replace(/\D/g, '');

            if (reqPhone.length < 10 || !userPhone.endsWith(reqPhone.slice(-10))) {
                return res.status(400).json({ success: false, message: 'Phone number does not match. Deletion failed.' });
            }

            await user.deleteOne();
            res.status(200).json({ success: true, message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upload verification document for user
// @route   POST /api/users/verify
// @access  Private (Customer only)
const uploadUserVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const { docType, url } = req.body;

            if (!docType || !url) {
                return res.status(400).json({ success: false, message: 'Document type and URL/Base64 data are required.' });
            }

            // Remove existing document of the same type if present, or append
            user.documents = user.documents.filter(doc => doc.docType !== docType);
            user.documents.push({ docType, url });

            await user.save();
            res.status(200).json({ success: true, message: 'Verification document uploaded successfully. Awaiting approval.' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error uploading user verification:', error);
        res.status(500).json({ success: false, message: 'Server error during upload.' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    uploadUserVerification
};
