import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from "path";
import fs from "fs";
import supabase from "../utils/supabaseClient"; // Pastikan path benar

const prisma = new PrismaClient();

export const createCourse = async (req: Request, res: Response) => {
  const {
    title,
    description,
    price,
    discount,
    creatorId,
    categoryId,
  } = req.body;

  const file = req.file;

  if (!title || !description || !price || !creatorId || !categoryId) {
    res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    let imageUrl: string | null = null;

    if (file) {
      const ext = path.extname(file.originalname);
      const fileName = `courses/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("courses") // nama bucket storage
        .upload(fileName, fs.readFileSync(file.path), {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        res.status(500).json({ message: "Upload gambar gagal" });
      }

      const { data } = supabase.storage.from("courses").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseInt(price),
        discount: discount ? parseInt(discount) : null,
        creatorId: parseInt(creatorId),
        categoryId: parseInt(categoryId),
        image: imageUrl!,
      },
    });

    res.status(201).json({ message: "Course created", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
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

