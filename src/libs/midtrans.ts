import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';

dotenv.config(); // pastikan env dibaca di sini juga kalau perlu

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
});