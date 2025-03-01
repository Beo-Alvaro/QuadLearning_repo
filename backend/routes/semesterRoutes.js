import express from 'express';
import { getSemesters, endSemester } from '../controllers/semesterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/semesters').get(protect, authorizeRoles('admin', 'teacher'), getSemesters);
router.route('/endSemester/:id').put(protect, authorizeRoles('admin', 'teacher'), endSemester);

export default router;