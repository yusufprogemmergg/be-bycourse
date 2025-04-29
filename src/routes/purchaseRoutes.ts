import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { purchaseCourses } from '../controllers/purchaseController';

const router = express.Router();

router.post('/', authenticate, purchaseCourses); // route untuk membeli course

export default router;
