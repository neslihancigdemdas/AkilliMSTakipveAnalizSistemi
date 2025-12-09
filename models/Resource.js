// models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    // Kaynak türü (MS Association, Psychological Support).
    resourceType: {
        type: String,
        required: true
    },
    // Kurum/Dernek adı.
    name: {
        type: String,
        required: true
    },
    // Telefon, e-posta, web sitesi gibi iletişim bilgileri.
    contactInfo: {
        phone: String,
        email: String,
        website: String,
        address: String
    },
    // Kaydın oluşturulma tarihi
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', resourceSchema);