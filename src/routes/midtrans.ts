import { PrismaClient } from '@prisma/client';
import express from 'express'
import midtransClient from 'midtrans-client'

const router = express.Router()
const prisma = new PrismaClient()

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
})

router.post('/midtrans-notification', async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body)
    const { transaction_status, order_id } = notification

    console.log('[Midtrans Notification]', transaction_status, order_id)

    let status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING'

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      status = 'SUCCESS'
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      status = 'FAILED'
    }

    await prisma.order.update({
      where: { id: Number(order_id) },
      data: { status },
    })

    res.status(200).json({ message: 'Notification handled' })
  } catch (error) {
    console.error('Notification error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

export default router
