const express = require('express');
const router = express.Router();

// Mock OTP Storage
const otps = {};

// Send OTP (Mock)
router.post('/whatsapp/send-otp', (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otps[phone] = otp;
    console.log(`[WhatsApp Mock] OTP for ${phone} is ${otp}`);
    res.json({ success: true, message: 'OTP sent via WhatsApp' });
});

// Verify OTP
router.post('/whatsapp/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (otps[phone] === otp || otp === '1234') { // Allow 1234 as master OTP
        res.json({ success: true, token: 'mock-jwt-token', role: 'worker' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

module.exports = router;
