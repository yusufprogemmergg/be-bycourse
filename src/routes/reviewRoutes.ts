import express from 'express';
import { createReview } from '../controllers/reviewController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/:courseId', authenticate, createReview); // user buat review setelah beli course

export default router;
