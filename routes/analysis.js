// routes/analysis.js (EXCEL İÇİN GÜNCELLENMİŞ)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SymptomLog = require('../models/SymptomLog');
const MedicationLog = require('../models/MedicationLog');
const User = require('../models/User');

router.get('/reports', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Son 30 günü hesapla
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        // 1. VERİLERİ ÇEK (Semptomlar ve İlaçlar)
        const symptomLogs = await SymptomLog.find({ 
            userId, 
            logDate: { $gte: oneMonthAgo } 
        }).sort({ logDate: 1 }); 

        const medicationLogs = await MedicationLog.find({ userId }).sort({ logDate: 1 });
        const userProfile = await User.findById(userId).select('msType firstName');

        // --- 2. GRAFİK VERİLERİ ---
        const fatigueChartData = symptomLogs.map(log => {
            const date = new Date(log.logDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            return { date: date, score: log.fatigueScore };
        });

        const takenCount = medicationLogs.filter(log => log.status && log.status.toLowerCase() === 'taken').length;
        const skippedCount = medicationLogs.filter(log => log.status && log.status.toLowerCase() === 'skipped').length;
        
        // --- 3. İSTATİSTİKLER ---
        let totalFatigue = 0;
        let highStressDays = 0;
        symptomLogs.forEach(log => {
            totalFatigue += log.fatigueScore || 0;
            if (log.stressLevel >= 7) highStressDays++;
        });
        const avgFatigue = symptomLogs.length > 0 ? (totalFatigue / symptomLogs.length).toFixed(1) : 0;
        const totalMeds = medicationLogs.length;
        const adherenceRate = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;

        const highStressLogs = symptomLogs.filter(log => log.stressLevel >= 7);
        let stressFatigueTotal = 0;
        highStressLogs.forEach(log => stressFatigueTotal += log.fatigueScore);
        const avgFatigueUnderStress = highStressLogs.length > 0 ? (stressFatigueTotal / highStressLogs.length).toFixed(1) : 0;

        // --- 4. YANIT GÖNDER (Raw Data Eklendi) ---
        res.json({
            userName: userProfile.firstName,
            msType: userProfile.msType,
            totalLogs: symptomLogs.length,
            analysis: {
                avgFatigue,
                highStressDays,
                adherenceRate,
                avgFatigueUnderStress
            },
            charts: {
                fatigueDates: fatigueChartData.map(d => d.date),
                fatigueScores: fatigueChartData.map(d => d.score),
                medicationCounts: [takenCount, skippedCount]
            },
            // EXCEL İÇİN HAM VERİLER:
            rawData: {
                symptoms: symptomLogs,
                medications: medicationLogs
            }
        });

    } catch (error) {
        console.error('Analiz hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;