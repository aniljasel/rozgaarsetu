require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await Admin.findOne({ email: 'admin@rozgaarsetu.com' });

        if (!adminExists) {
            await Admin.create({
                name: 'Super Admin',
                email: 'admin@rozgaarsetu.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('✅ Default Admin seeded successfully!');
            console.log('Email: admin@rozgaarsetu.com');
            console.log('Password: password123');
        } else {
            console.log('ℹ️ Admin already exists in DB');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
