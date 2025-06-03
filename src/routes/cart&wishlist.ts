import express from 'express';
import { addToCart, getUserCart, removeFromCart,  resetCart,  addToWishlist,
  getUserWishlist,
  removeFromWishlist,deleteWishlistItemById,deleteCartItemById } from '../controllers/cart&wishlistController';
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.post('/cart', authenticate, addToCart);
router.get('/cart', authenticate, getUserCart);
router.delete('/cart/:courseId', authenticate, removeFromCart);
router.delete('/reset', authenticate, resetCart);
router.post("/", addToWishlist);
router.get("/", getUserWishlist);
router.delete("/:courseId", removeFromWishlist);
router.delete("/cart/item/:id", deleteCartItemById);
router.delete("/wishlist/item/:id", deleteWishlistItemById);


export default router;