import express from 'express';
import { midtransWebhook } from '../controllers/orderController';

const router = express.Router();

router.post('/midtrans/webhook', express.json(), midtransWebhook);

export default router;