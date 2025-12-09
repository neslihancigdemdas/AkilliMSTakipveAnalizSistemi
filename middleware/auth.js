const jwt = require('jsonwebtoken');
// Güvenlik anahtarı
const JWT_SECRET = process.env.JWT_SECRET || 'cokgizli-ms-takip-anahtari'; 

module.exports = function(req, res, next) {
    // 1. Token'ı header'dan alıyoruz
    const token = req.header('x-auth-token'); 
    // Token yoksa, işlemi burada durdurup yetkisiz giriş hatası dönüyoruz.
    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı, yetkilendirme reddedildi.' });
    }
    try {
        // 2. Token'ın geçerliliğini ve süresini kontrol ediyoruz (Verify)
        const decoded = jwt.verify(token, JWT_SECRET);
        // 3. Token geçerliyse, içindeki kullanıcı bilgisini (payload) isteğe ekliyoruz.
        req.user = decoded.user; 
        // Her şey yolunda, sıradaki işleme geçebiliriz.
        next();
    } catch (err) {
        // Token hatalıysa veya süresi dolmuşsa hata dönüyoruz.
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};