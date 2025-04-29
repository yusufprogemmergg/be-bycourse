import express from 'express';
import { createProfile, getProfile, updateProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/authMiddleware'; // harus login dulu

const router = express.Router();

router.post('/', authenticate, createProfile);
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

export default router;
