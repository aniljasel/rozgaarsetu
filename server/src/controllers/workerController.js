const Worker = require('../models/Worker');

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private (Worker only)
const getWorkerProfile = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user._id);

        if (worker) {
            res.status(200).json({ success: true, worker });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error fetching worker profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (Worker only)
const updateWorkerProfile = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user._id);

        if (worker) {
            worker.name = req.body.name || worker.name;
            worker.email = req.body.email || worker.email;
            worker.serviceType = req.body.serviceType || worker.serviceType;
            worker.skills = req.body.skills || worker.skills;
            worker.experience = req.body.experience || worker.experience;
            if (req.body.hourlyRate !== undefined) worker.hourlyRate = req.body.hourlyRate;
            if (req.body.visitCharges !== undefined) worker.visitCharges = req.body.visitCharges;
            worker.address = req.body.address || worker.address;
            worker.profileImage = req.body.profileImage || worker.profileImage;

            if (req.body.upiId !== undefined) worker.upiId = req.body.upiId;
            if (req.body.bankAccount !== undefined) worker.bankAccount = req.body.bankAccount;

            if (req.body.voiceTranscript !== undefined) {
                worker.voiceTranscript = req.body.voiceTranscript;
            }

            if (req.body.location) {
                worker.location = req.body.location; // Should be { type: 'Point', coordinates: [lng, lat] }
            }

            const updatedWorker = await worker.save();
            res.status(200).json({ success: true, worker: updatedWorker });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error updating worker profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete worker account
// @route   DELETE /api/workers/profile
// @access  Private (Worker only)
const deleteWorkerAccount = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user._id);

        if (worker) {
            // Validate phone number passed in request body
            const reqPhone = (req.body.phone || '').replace(/\D/g, '');
            const workerPhone = (worker.phone || '').replace(/\D/g, '');

            if (reqPhone.length < 10 || !workerPhone.endsWith(reqPhone.slice(-10))) {
                return res.status(400).json({ success: false, message: 'Phone number does not match. Deletion failed.' });
            }

            await worker.deleteOne();
            res.status(200).json({ success: true, message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error deleting worker account:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all active/approved workers
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
    try {
        const { serviceType, search } = req.query;

        // Only return verified and approved workers to public
        let query = { isApproved: true, isVerified: true };

        if (serviceType) {
            query.serviceType = serviceType;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const workers = await Worker.find(query).select('-documents -voiceTranscript'); // Hide sensitive docs, not contact info

        res.status(200).json({ success: true, count: workers.length, workers });
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).select('-documents -voiceTranscript');

        if (worker) {
            res.status(200).json({ success: true, worker });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error fetching worker by ID:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upload verification document for worker
// @route   POST /api/workers/verify
// @access  Private (Worker only)
const uploadWorkerVerification = async (req, res) => {
    try {
        const worker = await Worker.findById(req.user._id);

        if (worker) {
            const { docType, url } = req.body;

            if (!docType || !url) {
                return res.status(400).json({ success: false, message: 'Document type and URL/Base64 data are required.' });
            }

            // Remove existing document of the same type if present, or just append
            worker.documents = worker.documents.filter(doc => doc.docType !== docType);
            worker.documents.push({ docType, url });

            await worker.save();
            res.status(200).json({ success: true, message: 'Verification document uploaded successfully. Awaiting approval.' });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found' });
        }
    } catch (error) {
        console.error('Error uploading worker verification:', error);
        res.status(500).json({ success: false, message: 'Server error during upload.' });
    }
};

module.exports = {
    getWorkerProfile,
    updateWorkerProfile,
    getWorkers,
    getWorkerById,
    deleteWorkerAccount,
    uploadWorkerVerification
};
