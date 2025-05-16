import express from 'express';
import cors from 'cors';
import path from 'path';
import orderRoutes from './routes/courseRoutes';
import authRoutes from './routes/authRoutes'; // <-- tambahkan ini
import profileRoutes from './routes/profileRoute';
import reviewRoutes from './routes/reviewRoutes';
import course from './routes/courseRoutes';
import purchase from './routes/purchaseRoutes';
import bodyParser from "body-parser";


const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.send("API is running...");
  });

// Routes
app.use('/order', orderRoutes);
app.use('/auth', authRoutes); // <-- tambahkan ini
app.use('/course', course); // <-- tambahkan ini
app.use('/api/menu', profileRoutes);
app.use('/review', reviewRoutes);
app.use('/purchase', purchase);

export default app;
