import express from 'express';
import { register, login, activateUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/activate/:token', activateUser);

export default router;