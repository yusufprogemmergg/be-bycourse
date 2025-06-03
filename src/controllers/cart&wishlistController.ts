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

export const addToWishlist = async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      res.status(400).json({ message: "Course sudah ada di wishlist" });
      return
    }

    const wishlistItem = await prisma.wishlist.create({
      data: { userId, courseId },
    });

    res.status(201).json({ message: "Berhasil ditambahkan ke wishlist", wishlistItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserWishlist = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: { course: true },
    });

    res.json({ wishlistItems });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.wishlist.deleteMany({
      where: { userId, courseId: parseInt(courseId) },
    });

    res.json({ message: "Berhasil dihapus dari wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const resetWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    await prisma.wishlist.deleteMany({
      where: { userId },
    });

    res.status(200).json({ message: "Wishlist berhasil dikosongkan." });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengosongkan wishlist.", error });
  }
};

export const deleteCartItemById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const cartId = parseInt(req.params.cartId);

  if (!userId) {
     res.status(401).json({ message: "Unauthorized" });return
  }

  if (isNaN(cartId)) {
     res.status(400).json({ message: "ID cart tidak valid" });return
  }

  try {
    const deleted = await prisma.cart.deleteMany({
      where: {
        id: cartId,
        userId,
      },
    });

    if (deleted.count === 0) {
       res.status(404).json({ message: "Item tidak ditemukan atau bukan milik Anda" });return
    }

    res.status(200).json({ message: "Item berhasil dihapus dari cart." });
  } catch (error) {
    console.error("Delete cart error:", error);
    res.status(500).json({ message: "Gagal menghapus item cart." });
  }
};



export const deleteWishlistItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await prisma.wishlist.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item || item.userId !== userId) {
      res.status(404).json({ message: "Item tidak ditemukan atau bukan milikmu" });return
    }

    await prisma.wishlist.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Item berhasil dihapus dari wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
