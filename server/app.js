const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const workerRoutes = require('./src/routes/workerRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// Default Route
app.get('/', (req, res) => {
    res.send('RozgaarSetu API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
