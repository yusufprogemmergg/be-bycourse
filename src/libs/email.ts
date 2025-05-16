import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'Zoho',
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: "yusuf_prasetiyo@zohomail.com",
      pass: "vCi5uz981X1H",
    },
    requireTLS: true,
  });

  await transporter.sendMail({
    from: `"bycourse" <${process.env.EMAIL_SMTP_USER}>`,
    to,
    subject,
    html,
  });
};