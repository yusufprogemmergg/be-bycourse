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
export const oauthOrMagicCallback = async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token || typeof access_token !== "string") {
      res.status(400).json({ message: "Access token tidak ditemukan" });
      return;
    }

    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data?.user) {
      res.status(400).json({ message: "Gagal ambil user Supabase", error });
      return;
    }

    const userSupabase = data.user;

    let user = await prisma.user.findUnique({
      where: { email: userSupabase.email! },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userSupabase.user_metadata?.full_name || userSupabase.email!,
          username: generateUsername(userSupabase.email!),
          email: userSupabase.email!,
          isActive: true,
          googleId: userSupabase.id,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Callback Error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};
