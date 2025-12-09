// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Güvenli Giriş için e-posta (eşsiz olmalı).
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Güvenli Giriş için şifrenin karma değeri (hash).
    passwordHash: {
        type: String,
        required: true
    },
    // Temel Profil bilgileri.
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    // MS Hastalığının Tipi .
    msType: {
        type: String,
        required: true
    },
    // Tanı aldığı yıl veya tarih.
    diagnosisYear: {
        type: mongoose.Schema.Types.Mixed, // Number veya Date kabul edebilir
        required: true
    },
    // Demografik bilgiler.
    gender: {
        type: String
    },
    ageGroup: {
        type: String
    },
    // Şifre Sıfırlama için geçici belirteç ve geçerlilik süresi.
    resetPasswordToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    }
});

module.exports = mongoose.model('User', userSchema);