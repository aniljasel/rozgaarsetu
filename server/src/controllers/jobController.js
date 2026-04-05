const Job = require('../models/Job');

// @desc    Create new job (Customer)
// @route   POST /api/jobs
// @access  Private (Customer)
const createJob = async (req, res) => {
    try {
        const { workerId, serviceType, description, location, address, scheduledDate, amount } = req.body;

        const job = new Job({
            customerId: req.user._id,
            workerId,
            serviceType,
            description,
            location,
            address,
            scheduledDate,
            amount: amount || null  // save amount if provided (e.g. worker's hourly rate)
        });

        const createdJob = await job.save();
        res.status(201).json({ success: true, job: createdJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server error while creating job' });
    }
};

// @desc    Get logged in user's jobs (Customer or Worker)
// @route   GET /api/jobs
// @access  Private (Customer, Worker)
const getMyJobs = async (req, res) => {
    try {
        let jobs;
        if (req.user.role === 'customer') {
            jobs = await Job.find({ customerId: req.user._id }).populate('workerId', 'name phone serviceType profileImage rating');
        } else if (req.user.role === 'worker') {
            // Include explicitly assigned jobs AND jobs that are open (workerId === null) and match the worker's service/skills
            jobs = await Job.find({
                $or: [
                    { workerId: req.user._id },
                    { workerId: null, status: 'pending' } // Open to all available
                ]
            }).populate('customerId', 'name phone address');
        }

        res.status(200).json({ success: true, count: jobs?.length || 0, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching jobs' });
    }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id/status
// @access  Private (Customer, Worker, Admin)
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Basic authorization check
        if (req.user.role === 'customer' && job.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this job' });
        }
        if (req.user.role === 'worker' && job.workerId && job.workerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this job' });
        }

        job.status = status || job.status;
        const updatedJob = await job.save();

        res.status(200).json({ success: true, job: updatedJob });
    } catch (error) {
        console.error('Error updating job status:', error);
        res.status(500).json({ success: false, message: 'Server error while updating job status' });
    }
};

// @desc    Update job payment status
// @route   PUT /api/jobs/:id/payment
// @access  Private (Customer, Admin)
const updateJobPayment = async (req, res) => {
    try {
        const { paymentStatus, amount } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        job.paymentStatus = paymentStatus || job.paymentStatus;
        if (amount) job.amount = amount;

        const updatedJob = await job.save();

        res.status(200).json({ success: true, job: updatedJob });
    } catch (error) {
        console.error('Error updating job payment:', error);
        res.status(500).json({ success: false, message: 'Server error while updating payment' });
    }
};

module.exports = {
    createJob,
    getMyJobs,
    updateJobStatus,
    updateJobPayment
};
