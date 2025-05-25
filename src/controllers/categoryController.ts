import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 Create Category
export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ message: "Nama kategori wajib diisi" });
  }

  try {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
        res.status(400).json({ message: "Kategori sudah ada" });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ message: "Kategori berhasil dibuat", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get All Categories
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        courses: true,
      },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get Category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!category) {
      res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Update Category
export const updateCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.json({ message: "Kategori diperbarui", category: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Kategori dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
