// controllers/moduleController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createModule = async (req: Request, res: Response) => {
  const { title, courseId, position } = req.body;

  if (!title || !courseId) {
    res.status(400).json({ message: "Judul dan courseId wajib diisi" });return 
  }

  try {
    const module = await prisma.module.create({
      data: {
        title,
        courseId: parseInt(courseId),
        position: position ? parseInt(position) : 0,
      },
    });

    res.status(201).json({ message: "Module dibuat", module });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getModulesWithLessons = async (req: Request, res: Response) => {
  const { courseId } = req.params;

  try {
    const modules = await prisma.module.findMany({
      where: { courseId: parseInt(courseId) },
      orderBy: { position: "asc" },
      include: {
        lessons: {
          orderBy: { position: "asc" },
        },
      },
    });

    res.status(200).json({ message: "Modules loaded", modules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// controllers/lessonController.ts
export const getLessonById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
    });

    if (!lesson) {
      res.status(404).json({ message: "Lesson tidak ditemukan" });return
    }

    res.status(200).json({ message: "Lesson ditemukan", lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

