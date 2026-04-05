const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    serviceType: { type: String, required: true },
    description: { type: String },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number] } // [longitude, latitude]
    },
    address: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    amount: { type: Number },
    scheduledDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
