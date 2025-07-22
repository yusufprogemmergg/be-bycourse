import express from 'express';
import { loginWithGoogle, sendMagicLink ,oauthCallback } from '../controllers/authController';

const router = express.Router();

router.post('/oauth/google', loginWithGoogle);
router.post('/magiclink', sendMagicLink);        // Redirect to Google
router.post('/oauth/callback', oauthCallback);

export default router;