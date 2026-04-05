const Worker = require('../models/Worker');
const User = require('../models/User');
const Job = require('../models/Job');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

// @desc    Get global settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getGlobalSettings();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update global settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateSettings = async (req, res) => {
    try {
        const { maintenanceMode, workerRegistration, customerRegistration } = req.body;
        
        let settings = await Settings.getGlobalSettings();
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (workerRegistration !== undefined) settings.workerRegistration = workerRegistration;
        if (customerRegistration !== undefined) settings.customerRegistration = customerRegistration;
        
        await settings.save();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve/Reject Worker Profile
// @route   PUT /api/admin/workers/:id/approve
// @access  Private (Admin only)
const approveWorker = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const worker = await Worker.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        worker.isApproved = isApproved;
        if (isApproved) {
            worker.isVerified = true; // Auto-verify when approved for now
        } else {
            worker.isVerified = false;
        }

        const updatedWorker = await worker.save();

        res.status(200).json({ success: true, worker: updatedWorker });
    } catch (error) {
        console.error('Error approving worker:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve/Reject User Profile
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
const approveUser = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isApproved = isApproved;
        if (isApproved) {
            user.isVerified = true;
        } else {
            user.isVerified = false;
        }

        const updatedUser = await user.save();

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update Admin Password
// @route   PUT /api/admin/password
// @access  Private (Admin only)
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Admin is attached by auth middleware
        const admin = await Admin.findById(req.user._id);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        // Pre-save hook will hash it automatically
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkers = await Worker.countDocuments();
        const totalJobs = await Job.countDocuments();
        const pendingApprovals = await Worker.countDocuments({ isApproved: false });

        // Get recent activity (last 5 jobs)
        const recentActivity = await Job.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customerId', 'name')
            .populate('workerId', 'name serviceType');

        // Get jobs per day for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentJobs = await Job.find({ createdAt: { $gte: sevenDaysAgo } }).select('createdAt');
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const jobsPerDay = Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return { name: days[d.getDay()], jobs: 0, dateStr: d.toDateString() };
        });

        recentJobs.forEach(job => {
            const dateStr = new Date(job.createdAt).toDateString();
            const dayObj = jobsPerDay.find(d => d.dateStr === dateStr);
            if (dayObj) dayObj.jobs++;
        });

        // City Data: Extract cities from worker addresses
        const workers = await Worker.find().select('address');
        const cityCounts = {};
        workers.forEach(w => {
            if (w.address) {
                let parts = w.address.split(',');
                let city = parts[parts.length > 1 ? parts.length - 2 : 0].trim();
                if (/\d/.test(city) && parts.length > 2) {
                    city = parts[parts.length - 3].trim();
                }
                
                if (city.length > 15) city = city.substring(0, 15) + '...';
                if (!city) city = 'Unknown';
                
                cityCounts[city] = (cityCounts[city] || 0) + 1;
            } else {
                cityCounts['Unknown'] = (cityCounts['Unknown'] || 0) + 1;
            }
        });

        let cityData = Object.keys(cityCounts).map(name => ({ name, value: cityCounts[name] }));
        cityData.sort((a, b) => b.value - a.value);
        cityData = cityData.slice(0, 4);
        if (cityData.length === 0) cityData = [{name: 'No Data', value: 1}];

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalWorkers,
                totalJobs,
                pendingApprovals,
                jobsPerDay,
                cityData,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).select('-password');
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all workers (Admin only)
// @route   GET /api/admin/workers
// @access  Private (Admin only)
const getAllWorkers = async (req, res) => {
    try {
        let query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.isApproved !== undefined) query.isApproved = req.query.isApproved === 'true';

        let workersQuery = Worker.find(query).select('-password');
        
        // Sorting and limiting for notifications
        if (req.query.sort) workersQuery = workersQuery.sort({ createdAt: -1 });
        if (req.query.limit) workersQuery = workersQuery.limit(parseInt(req.query.limit));

        const workers = await workersQuery;
        res.status(200).json({ success: true, count: workers.length, workers });
    } catch (error) {
        console.error('Error fetching admin workers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all jobs (Admin only)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
const getAllJobs = async (req, res) => {
    try {
        let query = {};
        if (req.query.status) query.status = req.query.status;

        let jobsQuery = Job.find(query)
            .populate('customerId', 'name phone')
            .populate('workerId', 'name phone serviceType');
            
        // Sorting and limiting
        if (req.query.sort) jobsQuery = jobsQuery.sort({ createdAt: -1 });
        if (req.query.limit) jobsQuery = jobsQuery.limit(parseInt(req.query.limit));

        const jobs = await jobsQuery;
        res.status(200).json({ success: true, count: jobs.length, jobs });
    } catch (error) {
        console.error('Error fetching admin jobs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    approveWorker,
    approveUser,
    getAdminStats,
    getAllUsers,
    getAllWorkers,
    getAllJobs,
    updatePassword,
    getSettings,
    updateSettings
};
