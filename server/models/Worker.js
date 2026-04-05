const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, required: true }, // Electrician, Plumber, etc.
    skills: [{ type: String }],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    },
    address: String,
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    voiceProfileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worker', WorkerSchema);
