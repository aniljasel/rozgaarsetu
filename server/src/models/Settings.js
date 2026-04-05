const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Using a single document to hold global platform settings
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    workerRegistration: {
        type: Boolean,
        default: true
    },
    customerRegistration: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getGlobalSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            maintenanceMode: false,
            workerRegistration: true,
            customerRegistration: true
        });
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
