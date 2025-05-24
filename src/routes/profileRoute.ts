import express from 'express';
import { createProfile, getProfile, updateProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/authMiddleware'; // harus login dulu
import { upload } from '../middlewares/upload'; // middleware untuk upload gambar

const router = express.Router();

router.post('/add', upload.single('avatar'), authenticate, createProfile);
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

export default router;
