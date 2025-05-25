import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import supabase from '../utils/supabaseClient';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();



export const createProfile = async (req: Request, res: Response) => {
  const {
    name, email, phone, bio,
    website, github, linkedin, twitter, youtube,
  } = req.body;
  const userId = req.user?.id;

  const file = req.file;

  if (!name || !email) {
    res.status(400).json({ message: 'Name dan email wajib diisi' });
  }

  try {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      res.status(400).json({ message: 'Profile already exists' });
    }

    let avatarUrl: string | null = null;

    if (file) {
      const ext = path.extname(file.originalname);
      const fileName = `avatars/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars') // nama bucket
        .upload(fileName, fs.readFileSync(file.path), {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        res.status(500).json({ message: 'Upload avatar gagal' });
      }

      // Dapatkan URL-nya
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = data.publicUrl;
    }

    const profile = await prisma.userProfile.create({
      data: {
        name,
        email,
        phone,
        bio,
        avatar: avatarUrl,
        website,
        github,
        linkedin,
        twitter,
        youtube,
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update profile user
export const updateProfile = async (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    bio,
    website,
    github,
    linkedin,
    twitter,
    youtube,
  } = req.body;

  const userId = req.user?.id;
  const file = req.file;
  const avatarPath = file?.filename ? `uploads/avatars/${file.filename}` : undefined;

  try {
    const existingProfile = await prisma.userProfile.findUnique({ where: { userId } });

    if (!existingProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        name,
        email,
        phone,
        bio,
        avatar: avatarPath || existingProfile.avatar, // pakai avatar baru jika ada, jika tidak tetap pakai lama
        website,
        github,
        linkedin,
        twitter,
        youtube,
      },
    });

    res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};