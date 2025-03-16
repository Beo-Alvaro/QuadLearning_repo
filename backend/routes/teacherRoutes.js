import express from 'express';

import { addGrade, updateGrade,  generateForm137, getTeacherSections, fillOutStudentForm, getTeacherDashboard, getStudentData, getTeacherSubjects, getSubjectGrades, getSubjectStudents,
     getTeacherAdvisoryClass, bulkAddGrades, getStudentGrades, getSectionById, getSectionStudents, getAttendanceData, saveAttendanceData, getAttendanceSummary, getTeacherSemesters, getSectionAverages, getSubjectPerformance} from '../controllers/teacherController.js';
import { protect, authorizeRoles, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);
router.use(teacher); // Make sure all routes are protected for teachers only

router.post('/add-grades', protect, authorizeRoles('teacher'), addGrade);
router.post('/bulk-add-grades', protect, authorizeRoles('teacher'), bulkAddGrades);
router.put('/grades/:id', protect, authorizeRoles('teacher'), updateGrade);
router.get('/attendance/summary', protect, teacher, getAttendanceSummary);
router.get('/section-averages', protect, teacher, getSectionAverages);
router.get('/subject-performance', protect, teacher, getSubjectPerformance);

router.get('/generate-form137/:studentId', protect, teacher, generateForm137);
router.get('/sections', getTeacherSections);

// Update these routes
router.get('/student/:studentId', protect, teacher, getStudentData); // GET route for fetching student data
router.post('/student/:studentId/form', protect, teacher, fillOutStudentForm); // PUT route for updating student data
router.get('/subjects', protect, teacher, getTeacherSubjects); // GET route for fetching teacher subjects
router.get('/subject-grades/:subjectId', protect, teacher, getSubjectGrades); // GET route for fetching subject grades
router.get('/subject-students', protect, teacher, getSubjectStudents); // GET route for fetching subject students
router.get('/advisorySections', protect, teacher, getTeacherAdvisoryClass); // GET route for fetching teacher advisory class
router.get('/dashboard', protect, teacher, getTeacherDashboard); // GET route for fetching teacher dashboard
router.get('/student-grades/:studentId', protect, teacher, getStudentGrades);

// Get a specific section by ID
router.get('/sections/:id', getSectionById);

// Get students for a section
router.get('/students', getSectionStudents);

// Get attendance data
router.get('/attendance', getAttendanceData);

// Save attendance data
router.post('/attendance', saveAttendanceData);

// Add this new route for fetching subjects by semester
router.get('/subjects/semester/:semesterId', protect, teacher, (req, res) => {
  const { semesterId } = req.params;
  
  if (!semesterId) {
    return res.status(400).json({ message: 'Semester ID is required' });
  }
  
  // Use the existing getTeacherSubjects function but pass the semesterId from params
  req.query.semesterId = semesterId;
  return getTeacherSubjects(req, res);
});

// Add this route to fetch semesters for teachers
router.get('/getSemesters', getTeacherSemesters);

export default router;

