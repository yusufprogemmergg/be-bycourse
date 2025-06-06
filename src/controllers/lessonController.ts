// controllers/lessonController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import supabase from "../utils/supabaseClient"; // pastikan ini ada

const prisma = new PrismaClient();    // Pastikan prisma sudah di-setup


export const addLesson = async (req: Request, res: Response) => {
  const { title, moduleId, position, content } = req.body;

  if (!title || !moduleId || !position || !content) {
    res.status(400).json({ message: "Semua field wajib diisi" });return
  }

  try {
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content, // ini sudah URL dari Supabase
        moduleId: parseInt(moduleId),
        position: parseInt(position),
      },
    });

    res.status(201).json({ message: "Lesson created", lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const updateLesson = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, position } = req.body;
  const file = req.file;

  try {
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLesson) {
      res.status(404).json({ message: "Lesson tidak ditemukan" });return
    }

    let content = existingLesson.content;

    // Jika user upload video baru
    if (file) {
      const ext = path.extname(file.originalname);
      const fileName = `lessons/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("lessons")
        .upload(fileName, fs.readFileSync(file.path), {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        res.status(500).json({ message: "Upload video gagal" });return
      }

      const { data } = supabase.storage.from("lessons").getPublicUrl(fileName);
      content = data.publicUrl;
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingLesson.title,
        content,
        position: position ? parseInt(position) : existingLesson.position,
      },
    });

    res.status(200).json({ message: "Lesson berhasil diperbarui", lesson: updatedLesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
