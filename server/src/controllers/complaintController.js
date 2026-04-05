const Complaint = require('../models/Complaint');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Customer, Worker)
const createComplaint = async (req, res) => {
    try {
        const { jobId, subject, description } = req.body;

        const complaint = new Complaint({
            userId: req.user._id,
            userModel: req.user.role === 'customer' ? 'User' : 'Worker',
            jobId: jobId || undefined,
            subject,
            description
        });

        const createdComplaint = await complaint.save();
        res.status(201).json({ success: true, complaint: createdComplaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin only)
const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('userId', 'name phone')
            .populate('jobId');

        res.status(200).json({ success: true, count: complaints?.length || 0, complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update complaint status/resolution
// @route   PUT /api/complaints/:id
// @access  Private (Admin only)
const updateComplaint = async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (resolution) complaint.resolution = resolution;

        const updatedComplaint = await complaint.save();
        res.status(200).json({ success: true, complaint: updatedComplaint });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user's own complaints
// @route   GET /api/complaints/my
// @access  Private (Customer, Worker)
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .populate('jobId')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: complaints?.length || 0, complaints });
    } catch (error) {
        console.error('Error fetching my complaints:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createComplaint,
    getComplaints,
    updateComplaint,
    getMyComplaints
};
