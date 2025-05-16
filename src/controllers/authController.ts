import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../libs/email';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req: Request, res: Response) => {
    const { name, username, email, password, passwordConfirm } = req.body;
  
    try {
      if (!name || !username || !email || !password || !passwordConfirm) {
        res.status(400).json({ message: 'All fields are required' });return
      }
  
      if (password !== passwordConfirm) {
        res.status(400).json({ message: 'Passwords do not match' });return
      }
  
      const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingUserByEmail) {
        res.status(400).json({ message: 'Email is already taken' });return
      }
  
      const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUserByUsername) {
        res.status(400).json({ message: 'Username is already taken' });return
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Generate activation token
      const activationToken = crypto.randomBytes(32).toString('hex');
  
      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          activationToken: activationToken,
          isActive: false,
        },
      });
  
      // Kirim activation link
      const activationLink = `${process.env.BASE_URL || 'http://localhost:8000'}/auth/activate/${activationToken}`;
      await sendEmail({
        to: email,
        subject: 'Activate Your Account',
        html: `
          <h1>Welcome to Our App, ${name}!</h1>
          <p>Please click the button below to activate your account:</p>
          <a href="${activationLink}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Activate Account</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
  
      res.status(201).json({
        message: 'User registered successfully. Please activate your account.',
        activationLink,
        data : user
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Account is not activated' });
      return
    }

    if (!user.password) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const activateUser = async (req: Request, res: Response) => {
    const { token } = req.params;
  
    try {
      const user = await prisma.user.findFirst({
        where: {
          activationToken: token,
        },
      });
  
      if (!user) {
        res.status(400).send(`
          <h1>Activation Failed</h1>
          <p>Invalid or expired activation link.</p>
        `);return
      }
  
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isActive: true,
          activationToken: null,
        },
      });
  
      res.send(`
        <h1>Account Activated Successfully</h1>
        <p>You can now <a href="/login">Login</a>.</p>
      `);
    
    } catch (error) {
      console.error('Error during activation:', error);
       res.status(500).send(`
        <h1>Server Error</h1>
        <p>Please try again later.</p>
      `);
    }
  };