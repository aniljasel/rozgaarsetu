const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    address: { type: String },
    profileImage: { type: String },
    skills: [{ type: String }],
    role: { type: String, default: 'customer' },
    isVerified: { type: Boolean, default: false }, // True after OTP verification
    isApproved: { type: Boolean, default: false }, // Admin approval for documents
    documents: [{
        docType: { type: String }, // 'aadhar', 'pan', 'voter', 'passport'
        url: { type: String }      // Base64 string or S3 URL
    }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
