import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express'
import { midtransClient } from 'midtrans-client'

const prisma = new PrismaClient();

export const handleMidtransWebhook = async (req: Request, res: Response) => {
  const {
    order_id,
    transaction_status,
    fraud_status
  } = req.body

  console.log('Webhook diterima:', { order_id, transaction_status, fraud_status })

  try {
    // Cari order berdasarkan snapOrderId
    const order = await prisma.order.findFirst({
      where: { snapOrderId: order_id }
    })

    if (!order) {
       res.status(404).json({ message: 'Order tidak ditemukan' });
       return;
    }

    // Update status sesuai dari Midtrans
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'SUCCESS' }
      })
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' }
      })
    }

     res.status(200).json({ message: 'Status order diperbarui' })
  } catch (error) {
    console.error('Error webhook:', error)
     res.status(500).json({ message: 'Server error' })
  }
}
