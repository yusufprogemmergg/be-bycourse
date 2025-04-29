import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pembelian Course
export const purchaseCourses = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { courseIds } = req.body;
    try {
      // Ambil semua kursus berdasarkan courseIds
      const courses = await prisma.course.findMany({
        where: {
          id: { in: courseIds.map((id: string) => Number(id)) },
        },
      });
  
      if (courses.length === 0) {
        res.status(404).json({ message: 'No courses found' });
        return;
      }
  
      // Cek apakah semua kursus berasal dari pembuat yang sama
      const creatorId = courses[0].creatorId;
      for (const course of courses) {
        if (course.creatorId !== creatorId) {
          res.status(400).json({ message: 'Courses must be from the same creator' });
          return;
        }
      }
  
      // Cek jika user sudah membeli kursus ini sebelumnya
      const existingPurchases = await prisma.purchase.findMany({
        where: {
          userId: userId,
          courseId: { in: courseIds.map((id: string) => Number(id)) },
        },
      });
  
      if (existingPurchases.length > 0) {
        res.status(400).json({ message: 'You have already purchased one or more of these courses' });
        return;
      }
  
      // Proses pembelian untuk semua kursus
      const purchases = await prisma.purchase.createMany({
        data: courseIds.map((courseId: string) => ({
          userId: userId,
          courseId: Number(courseId),
        })),
      });
  
      // Ambil semua kursus yang sudah dibeli oleh user
      const purchasedCourses = await prisma.purchase.findMany({
        where: { userId: userId },
        include: {
          course: true, // Menyertakan detail kursus
        },
      });
  
      res.status(201).json({
        message: 'Courses purchased successfully',
        purchases,
        purchasedCourses: purchasedCourses.map((purchase) => purchase.course), // Tampilkan detail kursus yang dibeli
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
      return;
    }
  };
  