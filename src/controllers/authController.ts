import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../libs/email';
import { profile } from 'console';
import supabase from "../utils/supabaseClient"; // Pastikan path benar


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'bycourse-secret';


  // GET /auth/oauth/google
export const loginWithGoogle = async (req: Request, res: Response) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `https://fe-bycourse.vercel.app/oauth-callback`,
    },
  });

  if (error) {
    res.status(500).json({ message: 'Failed to redirect to Google', error });return
  }

  res.redirect(data.url); // redirect ke Google login
};

export const sendMagicLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email wajib diisi' });return
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'https://fe-bycourse.vercel.app/magic-callback',
    },
  });

  if (error) {
    res.status(500).json({ message: 'Gagal mengirim magic link', error });return
  }

  res.json({ message: 'Magic link dikirim ke email' });
};


// GET /auth/oauth/callback
function generateUsername(email: string) {
  return email.split('@')[0] + '-' + Math.floor(Math.random() * 10000)
}

export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body

    if (!access_token || typeof access_token !== 'string') {
      res.status(400).json({ message: 'Access token tidak ditemukan' });return
    }

    // Ambil user Supabase pakai token
    const { data, error } = await supabase.auth.getUser(access_token)

    if (error || !data?.user) {
      res.status(400).json({ message: 'Gagal ambil user Supabase', error });return
    }

    const userSupabase = data.user

    // Cari user di database lokal
    let user = await prisma.user.findUnique({
      where: { email: userSupabase.email! },
    })

    // Jika belum ada → buat user baru
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userSupabase.user_metadata?.full_name || userSupabase.email!,
          username: generateUsername(userSupabase.email!),
          email: userSupabase.email!,
          isActive: true,
          googleId: userSupabase.id,
        },
      })
    }

    // Buat JWT lokal
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Kirim token ke frontend
    res.json({ token })
  } catch (err) {
    console.error('OAuth Callback Error:', err)
    res.status(500).json({ message: 'Server error', err })
  }
}
