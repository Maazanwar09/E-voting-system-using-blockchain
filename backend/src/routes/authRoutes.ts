import express from 'express';
import { registerUser, loginUser, getMe, updateWallet, promoteAdmin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/wallet', protect, updateWallet);
router.put('/promote', promoteAdmin);

export default router;
