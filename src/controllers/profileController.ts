import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buat profile user
export const createProfile = async (req: Request, res: Response) => {
  const { bio, avatarUrl, address } = req.body;
  const userId = req.user?.id; // dari auth middleware

  try {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
       res.status(400).json({ message: 'Profile already exists' });
       return
    }

    const profile = await prisma.userProfile.create({
      data: {
        bio,
        avatarUrl,
        address,
        user: {
          connect: { id: userId },
        },
      },
    });

     res.status(201).json({ message: 'Profile created', profile });
     return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Server error' });
     return
  }
};

// Get profile user
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return
    }

     res.status(200).json({ profile });
     return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Server error' });
     return
  }
};

// Update profile user
export const updateProfile = async (req: Request, res: Response) => {
  const { bio, avatarUrl, address } = req.body;
  const userId = req.user?.id;

  try {
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        bio,
        avatarUrl,
        address,
      },
    });

     res.status(200).json({ message: 'Profile updated', profile });
     return
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Server error' });
     return
  }
};
