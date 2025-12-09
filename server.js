require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Rotaları Çağır
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const analysisRoutes = require('./routes/analysis');
const startScheduler = require('./scheduler');

const app = express();

// Veritabanı Bağlantısı
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/AkilliMSDatabase';
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB Başarıyla Bağlandı.'))
    .catch(err => {
        console.error('MongoDB Bağlantı Hatası:', err);
        process.exit(1);
    });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'img')));

// Rotaları Kullan
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/analysis', analysisRoutes);

// Ana Sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Zamanlayıcıyı Başlat (Randevu Hatırlatma)
startScheduler();

const PORT = process.env.PORT || 5000;
// app.listen ile eski haline döndük
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`));