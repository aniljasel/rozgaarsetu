require('dotenv').config();
const twilio = require('twilio');

const generateOTP = () => {
    // Generate 4 digit OTP
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTP = async (phone, otp) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER?.trim();

    // Fallback if Twilio credentials are not set (e.g., in development)
    if (!accountSid || accountSid === 'your_account_sid' || !authToken || authToken === 'your_auth_token') {
        console.warn(`[OTP Service - DEV MODE] Twilio credentials missing or invalid.`);
        console.log(`[OTP Service] Sending OTP ${otp} to phone ${phone}`);
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    }

    try {
        const client = twilio(accountSid, authToken);
        console.log(`[OTP Service] Dispatching OTP to Twilio for ${phone}...`);

        const message = await client.messages.create({
            body: `Your RozgaarSetu verification code is: ${otp}. Do not share this code with anyone.`,
            from: twilioPhone,
            to: phone
        });

        console.log(`[OTP Service] Twilio message sent successfully: ${message.sid}`);
        return true;
    } catch (error) {
        console.error(`[OTP Service] Twilio Error:`, error.message);
        throw new Error(`Failed to send SMS OTP: ${error.message}`);
    }
};

module.exports = { generateOTP, sendOTP };
