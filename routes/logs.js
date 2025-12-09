const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); 

const SymptomLog = require('../models/SymptomLog'); 
const MedicationLog = require('../models/MedicationLog'); 
const AppointmentLog = require('../models/AppointmentLog');


// 1. SEMPTOM İŞLEMLERİ
// POST: Yeni Semptom Ekle
router.post('/symptom', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { 
            fatigueScore, stressLevel, moodStatus, temperatureInfluence, 
            restrictionNote, otherSymptomName, otherSymptomSeverity, logDate 
        } = req.body;

        const symptomDetailsArray = [];
        if (otherSymptomName && otherSymptomSeverity) {
            symptomDetailsArray.push({
                name: otherSymptomName, 
                severity: parseInt(otherSymptomSeverity),
                location: 'Belirtilmedi'
            });
        }

        const newLog = new SymptomLog({
            userId,
            fatigueScore: parseInt(fatigueScore),
            stressLevel: parseInt(stressLevel),
            moodStatus,
            temperatureInfluence,
            restrictionNote,
            symptomDetails: symptomDetailsArray,
            logDate: logDate ? new Date(logDate) : new Date()
        });

        await newLog.save();
        res.status(201).json({ message: 'Semptom günlüğü başarıyla kaydedildi.' });
    } catch (error) {
        console.error('Semptom kaydı hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// GET: Semptomları Listele 
router.get('/symptoms', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        // En yeniden en eskiye doğru sırala
        const logs = await SymptomLog.find({ userId }).sort({ logDate: -1 });
        res.json(logs);
    } catch (error) {
        console.error('Semptom listeleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// DELETE: Semptom Sil
router.delete('/symptom/:id', authMiddleware, async (req, res) => {
    try {
        const logId = req.params.id;
        const userId = req.user.id;
        const deletedLog = await SymptomLog.findOneAndDelete({ _id: logId, userId: userId });

        if (!deletedLog) return res.status(404).json({ message: 'Kayıt bulunamadı.' });
        res.json({ message: 'Kayıt silindi.' });
    } catch (error) {
        console.error('Silme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 2. İLAÇ İŞLEMLERİ
router.post('/medication', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { medicationName, dosage, status, logDate } = req.body;
        const newMedicationLog = new MedicationLog({ userId, medicationName, dosage, logDate: logDate || new Date(), status });
        await newMedicationLog.save();
        res.status(201).json({ message: 'İlaç takibi kaydedildi.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.get('/medications', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const medications = await MedicationLog.find({ userId }).sort({ logDate: -1 });
        res.json(medications);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.delete('/medication/:id', authMiddleware, async (req, res) => {
    try {
        const deletedLog = await MedicationLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedLog) return res.status(404).json({ message: 'Kayıt bulunamadı.' });
        res.json({ message: 'Silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 3. RANDEVU İŞLEMLERİ
router.post('/appointment', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 
        const { appointmentDate, doctorName, hospitalClinic, notes, reminderSet } = req.body;
        const newAppointmentLog = new AppointmentLog({
            userId,
            appointmentDate: new Date(appointmentDate),
            doctorName, hospitalClinic, notes, reminderSet: (reminderSet === 'true') 
        });
        await newAppointmentLog.save();
        res.status(201).json({ message: 'Randevu kaydedildi.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.get('/appointments', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await AppointmentLog.find({ userId }).sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

router.delete('/appointment/:id', authMiddleware, async (req, res) => {
    try {
        const deletedLog = await AppointmentLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedLog) return res.status(404).json({ message: 'Kayıt bulunamadı.' });
        res.json({ message: 'Silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

module.exports = router;