const Feedback = require('../models/Feedback');
const Worker = require('../models/Worker');

exports.createFeedback = async (req, res) => {
    try {
        const { workerId, rating, comment } = req.body;
        const customerId = req.user.id;

        const newFeedback = new Feedback({
            workerId,
            customerId,
            rating,
            comment
        });

        await newFeedback.save();

        // Update worker's average rating
        const feedbacks = await Feedback.find({ workerId });
        const totalRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        const avgRating = totalRating / feedbacks.length;

        await Worker.findByIdAndUpdate(workerId, {
            rating: avgRating.toFixed(1),
            reviewsCount: feedbacks.length
        });

        res.status(201).json({ success: true, feedback: newFeedback });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getWorkerFeedbacks = async (req, res) => {
    try {
        const { workerId } = req.params;
        const feedbacks = await Feedback.find({ workerId }).populate('customerId', 'name profileImage').sort({ createdAt: -1 });
        res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMyFeedbacks = async (req, res) => {
    try {
        const customerId = req.user.id || req.user._id;
        const feedbacks = await Feedback.find({ customerId })
            .populate('workerId', 'name serviceType profileImage rating address')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error('Error fetching customer feedbacks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
