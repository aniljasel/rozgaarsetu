const User = require('../models/User');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const { generateOTP, sendOTP } = require('../utils/otpService');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// Simple memory store for OTPs (Use Redis in production)
const otpStore = new Map();


// @desc    Get public global settings
// @route   GET /api/auth/settings
// @access  Public
const getSettingsHandler = async (req, res) => {
    try {
        const settings = await Settings.getGlobalSettings();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching settings' });
    }
};

// @desc    Generate and send OTP
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtpHandler = async (req, res) => {
    try {
        const { phone, role } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        if (!['customer', 'worker'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified (must be customer or worker)' });
        }

        const settings = await Settings.getGlobalSettings();
        if (settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: 'Platform is currently under maintenance. Please try again later.' });
        }

        // Check if registration is allowed for new users
        if (role === 'customer' && !settings.customerRegistration) {
            const exists = await User.findOne({ phone });
            if (!exists) {
                return res.status(403).json({ success: false, message: 'Customer registration is currently disabled by Admin.' });
            }
        }
        if (role === 'worker' && !settings.workerRegistration) {
            const exists = await Worker.findOne({ phone });
            if (!exists) {
                return res.status(403).json({ success: false, message: 'Worker registration is currently disabled by Admin.' });
            }
        }

        const otp = generateOTP();
        await sendOTP(phone, otp);

        // Store OTP with 5 mins expiration
        const expiresAt = Date.now() + 5 * 60 * 1000;
        otpStore.set(phone, { otp, expiresAt, role });

        res.status(200).json({
            success: true,
            message: `OTP sent successfully to ${phone}`,
            // NOTE: In a real app we wouldn't return the OTP here, this is for easy manual testing
            _devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
    } catch (error) {
        console.error('Error in sendOtpHandler:', error);
        res.status(500).json({ success: false, message: 'Server error while sending OTP' });
    }
};

// @desc    Verify OTP and login/register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtpHandler = async (req, res) => {
    try {
        const { phone, otp, role } = req.body;

        if (!phone || !otp || !role) {
            return res.status(400).json({ success: false, message: 'Phone, OTP, and role are required' });
        }

        const storedOtpData = otpStore.get(phone);

        if (!storedOtpData) {
            return res.status(400).json({ success: false, message: 'No OTP requested for this phone number' });
        }

        if (storedOtpData.otp !== otp || Date.now() > storedOtpData.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        if (storedOtpData.role !== role) {
            return res.status(400).json({ success: false, message: 'Role mismatch' });
        }

        // OTP Valid. Clear from store.
        otpStore.delete(phone);

        let user;
        const settings = await Settings.getGlobalSettings();

        if (settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: 'Platform is currently under maintenance. Please try again later.' });
        }

        if (role === 'customer') {
            user = await User.findOne({ phone });
            if (!user) {
                if (!settings.customerRegistration) {
                    return res.status(403).json({ success: false, message: 'Customer registration is currently disabled by Admin.' });
                }
                user = await User.create({ phone, role: 'customer', isVerified: true });
            } else if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        } else if (role === 'worker') {
            user = await Worker.findOne({ phone });
            if (!user) {
                if (!settings.workerRegistration) {
                    return res.status(403).json({ success: false, message: 'Worker registration is currently disabled by Admin.' });
                }
                user = await Worker.create({ phone, role: 'worker', isVerified: true });
            } else if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }

        if (!user) {
            return res.status(500).json({ success: false, message: 'Failed to create or fetch user record.' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            isNewUser: !user.name,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Error in verifyOtpHandler:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP verification' });
    }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLoginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(admin._id, admin.role);

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Error in adminLoginHandler:', error);
        res.status(500).json({ success: false, message: 'Server error during admin login' });
    }
};

module.exports = {
    sendOtpHandler,
    verifyOtpHandler,
    adminLoginHandler,
    getSettingsHandler
};
