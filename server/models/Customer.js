const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    name: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema);
