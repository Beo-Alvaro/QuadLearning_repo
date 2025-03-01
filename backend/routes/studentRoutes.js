const express = require('express');
const { viewStudentProfile, viewStudentGrades } = require('../controllers/studentController.js');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/profile', protect, authorizeRoles('student'), viewStudentProfile);
router.get('/grades', protect, authorizeRoles('student'), viewStudentGrades);

module.exports = router;
