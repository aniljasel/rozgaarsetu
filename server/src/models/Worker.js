const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String },
    role: { type: String, default: 'worker' },
    serviceType: { type: String }, // Electrician, Plumber, etc.
    skills: [{ type: String }],
    experience: { type: Number }, // in years
    hourlyRate: { type: Number, default: 0 },
    visitCharges: { type: Number, default: 0 }, // One-time visit/consultation fee
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // Admin approval
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    documents: [{
        docType: { type: String }, // 'aadhar', 'pan', 'voter'
        url: { type: String }      // Base64 string or S3 URL
    }], // URLs to ID proofs etc.
    profileImage: { type: String },
    voiceTranscript: { type: String },
    upiId: { type: String },  // Worker's UPI payment ID
    bankAccount: {             // Worker's bank account
        accountHolder: { type: String },
        accountNumber: { type: String },
        ifsc: { type: String }
    },
}, { timestamps: true });

// Ensure proper indexing for geospatial queries
WorkerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Worker', WorkerSchema);
