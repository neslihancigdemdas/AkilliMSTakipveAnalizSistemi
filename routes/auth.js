const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Postacı kütüphanesi
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cokgizli-ms-takip-anahtari';

// --- 1. E-POSTA GÖNDERİCİ AYARLARI ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dasneslihancigdem@gmail.com', 
        pass: 'zicoxklcsksknwkf' 
    }
});

// --- /api/auth/signup (Kayıt)  ---
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName, msType, diagnosisYear, gender, ageGroup } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({ email, passwordHash, firstName, lastName, msType, diagnosisYear, gender, ageGroup });
        await user.save();
        res.status(201).json({ message: 'Kayıt başarılı.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// --- /api/auth/login (Giriş)  ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Hatalı giriş.' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Hatalı giriş.' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ message: 'Giriş başarılı.', token, firstName: user.firstName });
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// --- /api/auth/forgot-password (GERÇEK E-POSTA GÖNDERME) ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.' });
        }

        // Token oluştur
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Token'ı veritabanına kaydet
        user.resetPasswordToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 saat geçerli
        await user.save();

        // Sıfırlama Linki
        const resetUrl = `http://localhost:5000/reset-password.html?token=${resetToken}`;

        // E-POSTA İÇERİĞİ
        const mailOptions = {
            from: '"Akıllı MS Takip Sistemi" <no-reply@mstakip.com>', // Gönderen adı
            to: user.email, // Alıcı (Kullanıcının maili)
            subject: '🔒 Şifre Sıfırlama Talebi',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2D6A4F;">Şifre Sıfırlama Talebi</h2>
                    <p>Merhaba <strong>${user.firstName}</strong>,</p>
                    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
                    <p>Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #2D6A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0;">Şifremi Sıfırla</a>
                    <p style="font-size: 0.9em; color: #666;">Bu işlemi siz yapmadıysanız, bu e-postayı dikkate almayınız.</p>
                    <p style="font-size: 0.8em; color: #999;">Link 1 saat süreyle geçerlidir.</p>
                </div>
            `
        };

        // E-postayı Gönder
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (veya Spam klasörünü) kontrol edin.' });

    } catch (error) {
        console.error('E-posta gönderme hatası:', error);
        res.status(500).json({ message: 'E-posta gönderilemedi. Gmail ayarlarınızı kontrol edin.' });
    }
});

// --- /api/auth/reset-password ---
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş bağlantı.' });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});
// --- GET /api/auth/user (Kullanıcı Bilgilerini Getir) ---
router.get('/user', async (req, res) => { 
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'Yetkisiz erişim.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-passwordHash'); // Şifreyi gönderme
        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Token geçersiz.' });
    }
});

// --- PUT /api/auth/profile (Profili Güncelle) ---
router.put('/profile', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'Yetkisiz erişim.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { firstName, lastName, msType, password } = req.body;
        
        const user = await User.findById(decoded.user.id);
        if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

        // Bilgileri güncelle
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (msType) user.msType = msType;

        // Eğer şifre de gönderildiyse güncelle
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: 'Profil başarıyla güncellendi.', user });

    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});
module.exports = router;