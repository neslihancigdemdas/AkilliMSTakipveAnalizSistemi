// models/AppointmentLog.js
const mongoose = require('mongoose');

const appointmentLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    hospitalClinic: {
        type: String
    },
    notes: {
        type: String
    },
    reminderSet: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AppointmentLog', appointmentLogSchema);