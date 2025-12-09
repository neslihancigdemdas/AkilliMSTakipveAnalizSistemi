const cron = require('node-cron');
const nodemailer = require('nodemailer');
const AppointmentLog = require('./models/AppointmentLog');
const User = require('./models/User');

// 1. POSTACI AYARLARI 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dasneslihancigdem@gmail.com', 
        pass: 'zico xklc sksk nwkf'            
    }
});

const startScheduler = () => {
    console.log('⏳ Hatırlatma Servisi Başlatıldı...');

    // 2. ZAMANLAYICIYI KUR (Her Dakika Çalışır)
    
    cron.schedule('* * * * *', async () => {
        console.log('--- Zamanlayıcı Kontrolü Yapılıyor ---');

        try {
            // Yarının tarih aralığını bul
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            // 3. SORGULA: Yarın randevusu olan ve hatırlatma isteyenleri bul
            const upcomingAppointments = await AppointmentLog.find({
                appointmentDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                reminderSet: true
            });

            if (upcomingAppointments.length === 0) {
                console.log('Yarın için hatırlatılacak randevu yok.');
                return;
            }

            console.log(`${upcomingAppointments.length} adet randevu bulundu. E-postalar gönderiliyor...`);

            // 4. HER RANDEVU İÇİN E-POSTA AT
            for (const app of upcomingAppointments) {
                // Kullanıcının e-posta adresini bulmak için User tablosuna bak
                const user = await User.findById(app.userId);

                if (user) {
                    const mailOptions = {
                        from: '"Akıllı MS Asistanı" <no-reply@mstakip.com>',
                        to: user.email,
                        subject: '📅 Yarın Doktor Randevunuz Var!',
                        html: `
                            <h3>Hatırlatma: Yarın Randevunuz Var</h3>
                            <p>Merhaba <strong>${user.firstName}</strong>,</p>
                            <p>Yarın için planlanmış doktor randevunuzu hatırlatmak istedik.</p>
                            <hr>
                            <p><strong>Doktor:</strong> ${app.doctorName}</p>
                            <p><strong>Hastane:</strong> ${app.hospitalClinic}</p>
                            <p><strong>Saat:</strong> ${new Date(app.appointmentDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                            <p><strong>Notlarınız:</strong> ${app.notes || 'Yok'}</p>
                            <hr>
                            <p>Sağlıklı günler dileriz.</p>
                        `
                    };

                    // Maili gönder
                    await transporter.sendMail(mailOptions);
                    console.log(`✅ E-posta gönderildi: ${user.email}`);
                }
            }

        } catch (error) {
            console.error('Zamanlayıcı hatası:', error);
        }
    });
};

module.exports = startScheduler;