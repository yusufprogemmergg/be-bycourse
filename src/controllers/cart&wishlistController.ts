import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addToCart = async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const userId = req.user.id; // diasumsikan kamu pakai middleware JWT

  try {
    const existing = await prisma.cart.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      res.status(400).json({ message: "Course sudah ada di cart" });return
    }

    const cartItem = await prisma.cart.create({
      data: { userId, courseId },
    });

    res.status(201).json({ message: "Berhasil ditambahkan ke cart", cartItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { course: true },
    });

    res.json({ cartItems });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.cart.deleteMany({
      where: { userId, courseId: parseInt(courseId) },
    });

    res.json({ message: "Berhasil dihapus dari cart" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const resetCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id // diasumsikan kamu pakai middleware auth

    await prisma.cart.deleteMany({
      where: {
        userId,
      },
    })

    res.status(200).json({ message: 'Cart berhasil dikosongkan setelah checkout.' })
  } catch (error) {
    console.error('Reset cart error:', error)
    res.status(500).json({ message: 'Gagal mengosongkan cart.' })
  }
}
