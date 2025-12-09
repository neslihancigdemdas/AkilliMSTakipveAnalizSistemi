// models/MedicationLog.js
const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
    // Hangi kullanıcıya ait olduğunu gösteren referans.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // İlacın adı.
    medicationName: {
        type: String,
        required: true
    },
    // Doz bilgisi 
    dosage: {
        type: String
    },
    // İlaç alma zamanları 
    schedule: {
        time: String, // Örn: "18:00"
        frequency: String // Örn: "Daily", "Weekly"
    },
    // Kaydın tutulduğu gün.
    logDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    // İlaç alındı mı/atlandı mı? (Taken, Skipped)
    status: {
        type: String,
        enum: ['Taken', 'Skipped', 'NotApplicable'],
        required: true
    }
});

module.exports = mongoose.model('MedicationLog', medicationLogSchema);