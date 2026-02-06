const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User Mongoose modeli 

const JWT_SECRET = process.env.JWT_SECRET || 'cokgizli-ms-takip-anahtari'; 

// --- /api/auth/signup (Kayıt Rotası) ---
// signup.html formunu işler.
router.post('/signup', async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            msType, 
            diagnosisYear, 
            gender, 
            ageGroup 
        } = req.body; // users koleksiyonundaki alanlar

        // 1. Kullanıcı zaten var mı kontrol et
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // 2. Şifreyi HASH'le (passwordHash alanı)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt); 

        // 3. Yeni Kullanıcı Belgesini Oluşturma
        user = new User({
            email,
            passwordHash,
            firstName,
            lastName,
            msType, 
            diagnosisYear, 
            gender,
            ageGroup
        });

        // 4. Veritabanına kaydet
        await user.save();

        // Başarılı yanıt
        res.status(201).json({ 
            message: 'Kayıt başarıyla tamamlandı. Lütfen giriş yapın.', 
        });

    } catch (error) {
        console.error('Kayıt işlemi hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası, kayıt yapılamadı.' });
    }
});

// --- /api/auth/login (Giriş Rotası) ---
// login.html formunu işler.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kullanıcının varlığını kontrol et
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // 2. Şifreyi Karşılaştır (passwordHash ile)
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // 3. Başarılı ise JWT (Token) Oluştur
        const payload = {
            user: {
                id: user.id 
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // 1 saat geçerlilik süresi
            (err, token) => {
                if (err) throw err;
                
                // 4. Token'ı ve temel bilgileri yanıt olarak gönder
                res.json({ 
                    message: 'Giriş başarılı.', 
                    token, 
                    firstName: user.firstName,
                    msType: user.msType 
                });
            }
        );

    } catch (error) {
        console.error('Giriş işlemi hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası, giriş yapılamadı.' });
    }
});

module.exports = router;
