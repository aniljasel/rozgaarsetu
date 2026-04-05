const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendOtpHandler, verifyOtpHandler, adminLoginHandler, getSettingsHandler } = require('../controllers/authController');

const router = express.Router();

// Public settings route
router.get('/settings', getSettingsHandler);

// Rate limiter for OTP requests to prevent SMS bombing
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 OTP requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { success: false, message: "Too many OTP requests from this IP, please try again after 15 minutes" }
});

router.post('/send-otp', otpLimiter, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.post('/admin/login', adminLoginHandler);

module.exports = router;
