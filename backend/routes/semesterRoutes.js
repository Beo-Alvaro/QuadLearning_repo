const express = require('express');
const { getSemesters } = require('../controllers/semesterController.js');
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/semesterssemesters').get(protect, authorizeRoles('admin', 'teacher'), authorizeRoles('admin', 'teacher'), getSemesters);
router.route('/endSemester/:id').put(protect, authorizeRoles('admin', 'teacher'), endSemester);

module.exports = router;
