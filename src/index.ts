import app from '../src/app';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes'; // sesuaikan dengan lokasi route

app.use(cors({
    origin: ['https://fe-bycourse.vercel.app'],
    credentials: true, // jika pakai cookie
}));


dotenv.config();
export default app;

app.use(express.json());
