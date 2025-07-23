import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import supabase from "../utils/supabaseClient";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "bycourse-secret";

function generateUsername(email: string) {
  return email.split("@")[0] + "-" + Math.floor(Math.random() * 10000);
}

export const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://fe-bycourse.vercel.app/oauth-callback',
    },
  })

  if (error) {
    alert('Gagal login dengan Google')
    console.error(error)
  } else {
    // Redirect dilakukan otomatis oleh Supabase melalui data.url
    window.location.href = data.url
  }
}


// ======== Magic Link Login ========
export const sendMagicLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `https://fe-bycourse.vercel.app/magic-callback`,
    },
  });

  if (error) {
    res.status(500).json({ message: "Gagal kirim Magic Link", error });
    return;
  }

  res.json({ message: "Magic link dikirim ke email" });
};

// ======== Callback ========
export const oauthCallback = async (req: Request, res: Response) => {
  const { access_token } = req.body

  if (!access_token) {
     res.status(400).json({ message: 'Token tidak ditemukan' });return
  }

  try {
    const { data: userInfo, error } = await supabase.auth.getUser(access_token)

    if (error || !userInfo?.user?.email) {
      console.error('Gagal ambil user:', error)
       res.status(401).json({ message: 'Token tidak valid' });return
    }

    const user = userInfo.user

    // Simpan user ke database kamu kalau perlu
    // const existingUser = await prisma.user.upsert(...)

    // Buat JWT lokal
    const jwtToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

     res.json({ token: jwtToken })
  } catch (err) {
    console.error('Internal error:', err)
     res.status(500).json({ message: 'Internal Server Error' })
  }
}