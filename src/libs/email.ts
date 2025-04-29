// src/lib/email.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: process.env.EMAIL_SMTP_USER!,
    pass: process.env.EMAIL_SMTP_PASS!,
  },
});

export async function sendActivationEmail(to: string, activationLink: string) {
  const mailOptions = {
    from: `"E-Kantin" <${process.env.EMAIL_SMTP_USER}>`,
    to,
    subject: 'Aktivasi Akun Anda',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <h2>Selamat datang di E-Kantin!</h2>
        <p>Silakan klik tombol di bawah ini untuk mengaktifkan akun Anda:</p>
        <a href="${activationLink}"
           style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
          Aktivasi Akun
        </a>
        <p>Jika Anda tidak mendaftar, abaikan email ini.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
