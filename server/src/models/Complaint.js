const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['User', 'Worker'] },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    resolution: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
