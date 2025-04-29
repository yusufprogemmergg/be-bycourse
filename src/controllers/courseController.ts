import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Course (user jual course)
export const createCourse = async (req: Request, res: Response) => {
  const { title, description, price, category, discount } = req.body;
  const userId = req.user?.id;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: 'Image is required' });
    return;
  }

  const imageUrl = `/uploads/${file.filename}`;

  const originalPrice = Number(price);
  const discountAmount = discount ? Number(discount) : 0;
  const discountedPrice = discountAmount > 0
    ? originalPrice - (originalPrice * discountAmount) / 100
    : originalPrice;

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
        price: originalPrice,
        category,
        discount: discountAmount,
        creator: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        ...course,
        price: discountedPrice,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateCourse = async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);
  const { title, description, price, category, discount } = req.body;
  const userId = req.user?.id;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return 
    }

    if (course.creatorId !== userId) {
      res.status(403).json({ message: 'You are not the creator of this course' });
      return 
    }

    // Hitung harga baru setelah diskon (jika diskon ada)
    const discountAmount = discount ? Number(discount) : 0;
    const discountedPrice = discountAmount > 0 ? price - (price * discountAmount) / 100 : price;

    // Update course dengan diskon dan data lainnya
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { 
        title,
        description,
        price: Number(price),
        category,
        discount: discountAmount,
      },
    });

    res.status(200).json({
      message: 'Course updated successfully',
      course: { ...updatedCourse, discountedPrice },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// List all Courses (lihat semua course)
export const listCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ courses });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};

// Get Detail Course by ID
export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return
    }

    res.status(200).json({ course });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};

// List courses yang TIDAK dibuat user (buat beli)
export const listOtherCourses = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: {
          not: userId,
        },
      },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ courses });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};

// List courses yang dibuat oleh user sendiri
export const listUserCourses = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ courses });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};

