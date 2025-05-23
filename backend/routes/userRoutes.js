import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
const router = express.Router();
import {
    authUser,
    logoutUser,
    getAdminId
} from '../controllers/userController.js';



router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.get('/adminId', protect, getAdminId);

export default router;