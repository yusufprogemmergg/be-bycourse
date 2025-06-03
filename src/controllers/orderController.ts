import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import midtransClient from 'midtrans-client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export const createOrder = async (req: Request, res: Response) => {
  console.log('SERVER KEY:', process.env.MIDTRANS_SERVER_KEY); // debug sementara

  const userId = req.user?.id;
  const { courseIds } = req.body;

  if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
    });

    const totalPrice = courses.reduce((acc, course) => {
      const finalPrice = course.discount
        ? course.price - (course.price * course.discount) / 100
        : course.price;
      return acc + finalPrice;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        orderItems: {
          create: courses.map(course => {
            const finalPrice = course.discount
              ? course.price - (course.price * course.discount) / 100
              : course.price;
            return {
              courseId: course.id,
              price: finalPrice,
            };
          }),
        },
      },
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: totalPrice,
      },
      customer_details: {
        email: req.user?.email,
      },
      credit_card: {
        secure: true,
      },
    });

    res.status(201).json({
      message: 'Order created',
      orderId: order.id,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Midtrans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createMidtransTransaction = async (req: Request, res: Response) => {
  const { orderId, grossAmount, user } = req.body;

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal membuat transaksi Midtrans' });
  }
};

export const midtransWebhook = async (req: Request, res: Response) => {
  try {
    const { order_id, transaction_status } = req.body;
    const orderId = parseInt(order_id.split('-')[1]);

    if (transaction_status === 'settlement') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (order) {
        for (const item of order.orderItems) {
          await prisma.purchase.create({
            data: {
              userId: order.userId,
              courseId: item.courseId,
            },
          });
        }
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook error' });
  }
};

