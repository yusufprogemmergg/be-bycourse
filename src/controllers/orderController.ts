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

// ============ CREATE ORDER ============

export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { courseIds } = req.body;

  if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    // 1. Cek course yang sudah dibeli
    const paidOrders = await prisma.order.findMany({
      where: {
        userId,
        status: 'PAID',
        orderItems: {
          some: {
            courseId: { in: courseIds },
          },
        },
      },
      include: {
        orderItems: true,
      },
    });

    const alreadyBoughtCourseIds = new Set(
      paidOrders.flatMap(order =>
        order.orderItems.map(item => item.courseId)
      )
    );

    const newCourseIds = courseIds.filter(id => !alreadyBoughtCourseIds.has(id));

    if (newCourseIds.length === 0) {
      res.status(400).json({ message: 'Semua course sudah dibeli' });
      return;
    }

    // 2. Ambil detail course
    const courses = await prisma.course.findMany({
      where: { id: { in: newCourseIds } },
    });

    // 3. Hitung total harga (pastikan integer)
    const totalPrice = Math.round(courses.reduce((acc, course) => {
      const finalPrice = course.discount
        ? course.price - (course.price * course.discount) / 100
        : course.price;
      return acc + finalPrice;
    }, 0));

    // 4. Buat order
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
              price: Math.round(finalPrice), // pastikan juga di sini integer
            };
          }),
        },
      },
    });

    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;

    // 5. Buat transaksi Midtrans
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalPrice, // sekarang pasti integer
      },
      customer_details: {
        email: req.user?.email,
      },
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: "https://fe-bycourse.vercel.app/success",
      },
    });

    // 6. Simpan snapOrderId
    await prisma.order.update({
      where: { id: order.id },
      data: {
        snapOrderId: midtransOrderId,
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
        gross_amount: Math.round(grossAmount), // tambahkan pembulatan di sini juga
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
      // Update order menjadi PAID
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook error' });
  }
};

