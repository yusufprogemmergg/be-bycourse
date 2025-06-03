import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from "path";
import fs from "fs";
import supabase from "../utils/supabaseClient"; // Pastikan path benar

const prisma = new PrismaClient();
export const createCourse = async (req: Request, res: Response) => {
  const { title, description, price, discount, categoryId } = req.body;
  const file = req.file;
  const creatorId = req.user?.id;

  if (!creatorId || !title || !description || !price || !categoryId) {
    res.status(400).json({ message: "Semua field wajib diisi" }); return
  }

  try {
    let imageUrl: string | null = null;

    if (file) {
      const ext = path.extname(file.originalname);
      const fileName = `courses/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("courses")
        .upload(fileName, fs.readFileSync(file.path), {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        res.status(500).json({ message: "Upload gambar gagal" }); return
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
        categoryId: parseInt(categoryId),
        image: imageUrl ?? "",
        creatorId: parseInt(creatorId),
      },
    });

    const finalPrice = course.discount
      ? Math.round(course.price - (course.price * course.discount / 100))
      : course.price;

    res.status(201).json({
      message: "Course created",
      course: {
        ...course,
        finalPrice,
      },
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const updateCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id);
  const { title, description, price, discount, categoryId } = req.body;
  const file = req.file;
  const creatorId = req.user?.id;

  if (!creatorId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      res.status(404).json({ message: "Course tidak ditemukan" }); return
    }

    if (existingCourse.creatorId !== creatorId) {
      res.status(403).json({ message: "Akses ditolak, bukan pembuat course" });
    }

    let imageUrl = existingCourse.image;

    if (file) {
      const ext = path.extname(file.originalname);
      const fileName = `courses/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("courses")
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

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || existingCourse.title,
        description: description || existingCourse.description,
        price: price ? parseInt(price) : existingCourse.price,
        discount: discount ? parseInt(discount) : existingCourse.discount,
        categoryId: categoryId ? parseInt(categoryId) : existingCourse.categoryId,
        image: imageUrl,
      },
    });

    const finalPrice = updatedCourse.discount
      ? Math.round(updatedCourse.price - (updatedCourse.price * updatedCourse.discount / 100))
      : updatedCourse.price;

    res.json({
      message: "Course berhasil diupdate",
      course: {
        ...updatedCourse,
        finalPrice,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
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


export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user.Id // asumsikan middleware JWT menyimpan userId di req

  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    let isPurchased = false
    if (userId) {
      const order = await prisma.order.findFirst({
        where: {
          userId,
          status: 'PAID',
          orderItems: {
            some: {
              courseId: Number(id),
            },
          },
        },
      })
      isPurchased = !!order
    }


    return res.status(200).json({
      ...course,
      isPurchased,
    })
  } catch (error) {
    console.error('getCourseById error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// List courses yang TIDAK dibuat user (buat beli)
export const getAvailableCourses = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  console.log("User ID:", userId);

  if (!userId) {
    res.status(401).json({ message: "User tidak terautentikasi" }); return
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: {
          not: parseInt(userId),
        },
      },
      include: {
        category: true,
      },
    });

    const result = courses.map(course => ({
      ...course,
      finalPrice: course.discount
        ? Math.round(course.price - (course.price * course.discount / 100))
        : course.price,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil course" });
  }
};


// List courses yang dibuat oleh user sendiri
export const getMyCourses = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: parseInt(userId),
      },
      include: {
        category: true,
      },
    });

    const result = courses.map(course => ({
      ...course,
      finalPrice: course.discount
        ? Math.round(course.price - (course.price * course.discount / 100))
        : course.price,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil course saya" });
  }
};

export const getCoursesByCreatorId = async (req: Request, res: Response) => {
  const { creatorId } = req.params;

  try {
    const courses = await prisma.course.findMany({
      where: {
        creatorId: parseInt(creatorId),
      },
      include: {
        category: true,
      },
    });

    const result = courses.map(course => ({
      ...course,
      finalPrice: course.discount
        ? Math.round(course.price - (course.price * course.discount / 100))
        : course.price,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil course dari creator tersebut" });
  }
};

// controllers/courseContentController.ts
export const getCourseContent = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId);
  const userId = req.user?.id;

  try {
    const isPurchased = await prisma.purchase.findFirst({
      where: {
        courseId,
        userId,
      },
    });

    if (!isPurchased) {
      res.status(403).json({ message: "Akses ditolak. Kamu belum membeli course ini." }); return
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
        },
      },
    });

    res.json({ courseId, modules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


