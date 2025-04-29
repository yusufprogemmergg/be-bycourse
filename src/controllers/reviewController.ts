import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buat Review
export const createReview = async (req: Request, res: Response) => {
  const { courseId, rating, comment } = req.body;
  const userId = req.user?.id;

  try {
    // Cek apakah user sudah membeli course ini
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: userId,
        courseId: Number(courseId),
      },
    });

    if (!purchase) {
      res.status(403).json({ message: 'You must purchase the course before leaving a review' });
      return
    }

    // Cek apakah user sudah memberikan review pada course ini
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        courseId: Number(courseId),
      },
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this course' });
      return
    }

    // Buat review baru
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: userId,
        courseId: Number(courseId),
      },
    });

    res.status(201).json({ message: 'Review added successfully', review });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};
