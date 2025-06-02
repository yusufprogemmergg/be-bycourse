import express from 'express';
import { createOrder, midtransWebhook } from '../controllers/orderController';
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post('/checkout', authenticate, createOrder);
router.post('/webhook', express.json({ type: '*/*' }), midtransWebhook);

export default router;