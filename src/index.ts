import app from '../src/app';
import dotenv from 'dotenv';
import express from 'express';
import orderRoutes from './routes/orderRoutes'; // sesuaikan dengan lokasi route


dotenv.config();
export default app;

app.use(express.json());
