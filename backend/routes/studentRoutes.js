import express from 'express';
import { viewStudentProfile, viewStudentGrades, updateStudentProfile } from '../controllers/studentController.js';
import { protect, authorizeRoles} from '../middleware/authMiddleware.js';

const router = express.Router();


router.put('/update-profile', protect, authorizeRoles('student'), updateStudentProfile);
router.get('/profile', protect, authorizeRoles('student'), viewStudentProfile);
router.get('/grades', protect, authorizeRoles('student'), viewStudentGrades);
export default router;
