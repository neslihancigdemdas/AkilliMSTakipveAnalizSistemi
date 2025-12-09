// models/SymptomLog.js
const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
    // Merkezi Takip için gerekli, hangi kullanıcıya ait olduğunu gösterir.
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Düzenli Kayıt Tutma için gerekli.
    logDate: { 
        type: Date, 
        default: Date.now 
    },
    // Yorgunluk Takibi için gerekli.
    fatigueScore: { 
        type: Number, 
        min: 1, 
        max: 10 
    },
    // Semptom Çeşitliliği/Şiddeti için gerekli (Array of Objects).
    symptomDetails: [{ 
        name: String, // Semptomun adı 
        severity: Number, // Şiddet seviyesi 
        location: String // Vücut Haritası üzerinden yeri
    }],
    // Duygudurum Takibi için gerekli.
    moodStatus: { 
        type: String 
    },
    // Tetikleyici Analizi için gerekli.
    stressLevel: { 
        type: Number, 
        min: 1, 
        max: 10 
    },
    // Sıcaklık Tetikleyicisi için gerekli.
    temperatureInfluence: { 
        type: String 
    },
    // Kısıtlama Yönetimi için gerekli not.
    restrictionNote: { 
        type: String 
    }
});

module.exports = mongoose.model('SymptomLog', symptomLogSchema);