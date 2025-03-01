import express from 'express';
import { viewStudentProfile, viewStudentGrades } from '../controllers/studentController.js';
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';

const router = express.Router();



router.get('/profile', protect, authorizeRoles('student'), viewStudentProfile);
router.get('/grades', protect, authorizeRoles('student'), viewStudentGrades);
export default router;