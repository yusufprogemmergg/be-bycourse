import express from 'express';
import { getMyBoughtCourses, getBoughtCourseById } from '../controllers/courseController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Semua endpoint memerlukan autentikasi
router.use(authenticate);

// GET semua course yang sudah dibeli oleh user
router.get('/', getMyBoughtCourses);

// GET detail course tertentu (by ID) yang sudah dibeli
router.get('/:id', getBoughtCourseById);

export default router;