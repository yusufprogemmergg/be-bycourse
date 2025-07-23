import express from 'express';
import { handleGoogleLogin, sendMagicLink , oauthCallback} from '../controllers/authController';

const router = express.Router();

router.post('/oauth/google', handleGoogleLogin);
router.post('/magiclink', sendMagicLink);        // Redirect to Google
router.post('/oauth/callback', oauthCallback);

export default router;