import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: parseInt(process.env.EMAIL_SMTP_PORT || '465'),
    secure: process.env.EMAIL_SMTP_SECURE === 'true', // true untuk port 465
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Your App Name" <${process.env.EMAIL_SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
