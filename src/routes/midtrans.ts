// routes/webhook.ts
import express from 'express';
import { PrismaClient } from "@prisma/client";

// Langsung buat instance PrismaClient
const prisma = new PrismaClient();
import crypto from 'crypto';

const router = express.Router();

router.post('/webhook/midtrans', express.json(), (req, res) => {
  (async () => {
    try {
      const {
        order_id,
        transaction_status,
        fraud_status,
        signature_key,
        status_code,
        gross_amount,
      } = req.body;

      // ✅ Validasi Signature
      const serverKey = process.env.MIDTRANS_SERVER_KEY!;
      const inputSignature = crypto
        .createHash('sha512')
        .update(order_id + status_code + gross_amount + serverKey)
        .digest('hex');

      if (signature_key !== inputSignature) {
        res.status(403).json({ message: 'Invalid signature' });
        return;
      }

      // ✅ Update status transaksi di database
      const status = transaction_status.toUpperCase(); // settlement, cancel, etc.
      let finalStatus = 'PENDING';

      if (status === 'SETTLEMENT') {
        finalStatus = 'PAID';
      } else if (status === 'CANCEL' || status === 'EXPIRE') {
        finalStatus = 'CANCELLED';
      }

      await prisma.order.updateMany({
        where: {
          snapOrderId: order_id,
        },
        data: {
          status: finalStatus,
        },
      });

      res.status(200).json({ message: 'Webhook received successfully' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })();
});

export default router;
