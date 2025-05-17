import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: "yusuf_prasetiyo@zohomail.com",
      pass: process.env.ZOHO_APP_PASSWORD!, // lebih baik gunakan .env
    },
  });

  await transporter.sendMail({
    from: "yusuf_prasetiyo@zohomail.com",
    to,
    subject,
    html,
  });
};
