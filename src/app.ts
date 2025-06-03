import { midtransClient } from 'midtrans-client';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import orderRoutes from './routes/courseRoutes';
import authRoutes from './routes/authRoutes'; // <-- tambahkan ini
import profileRoutes from './routes/profileRoute';
import reviewRoutes from './routes/reviewRoutes';
import course from './routes/courseRoutes';
import purchase from './routes/orderRoutes';
import categoryRoutes from "./routes/categoryRoute";
import module from './routes/moduleRoutes';
import cartWishlist from './routes/cart&wishlist';
import midtrans from './routes/midtrans'

import bodyParser from "body-parser";


const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express API on Vercel!');
  });

  app.get('/test', (req, res) => {
    res.json({ message: 'Test route works!' });
  });

  console.log("DATABASE_URL", process.env.DATABASE_URL);
// Routes
app.use('/order', orderRoutes);
app.use('/auth', authRoutes); // <-- tambahkan ini
app.use('/course', course); // <-- tambahkan ini
app.use('/profile', profileRoutes);
app.use('/review', reviewRoutes);
app.use('/order', purchase);
app.use("/categories", categoryRoutes);
app.use('/module', module);
app.use('/cart-wishlist', cartWishlist);
app.use('/api', midtrans);

export default app;
