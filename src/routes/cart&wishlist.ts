import express from 'express';
import { addToCart, getUserCart, removeFromCart } from '../controllers/cart&wishlistController';
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post('/cart', authenticate, addToCart);
router.get('/cart', authenticate, getUserCart);
router.delete('/cart/:courseId', authenticate, removeFromCart);

export default router;