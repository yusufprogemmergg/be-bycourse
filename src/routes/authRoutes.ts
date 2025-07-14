import express from 'express';
import { register, login, activateUser, loginWithGoogle, oauthCallback } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/activate/:token', activateUser);
router.get('/oauth/google', loginWithGoogle);        // Redirect to Google
router.post('/oauth/callback', oauthCallback);

export default router;