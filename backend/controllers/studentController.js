import asyncHandler from 'express-async-handler';
import Student from '../models/studentModel.js'; 
import Grade from '../models/gradeModel.js';

// @desc    Get logged-in student's profile
// @route   GET /api/student/profile
// @access  Private/Student
const viewStudentProfile = asyncHandler(async (req, res) => {
    try {
        // Find the student with populated fields including subjects
        const student = await Student.findOne({ user: req.user._id })
            .populate('section', 'name')
            .populate('strand', 'name')
            .populate('yearLevel', 'name')
            .populate({
                path: 'userData',
                select: 'subjects',
                populate: {
                    path: 'subjects',
                    select: 'name code'
                }
            })
            .lean();
            
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student profile not found'
                });
            }

        // Separately fetch grades with proper population
        const grades = await Grade.find({ 
            student: student._id,
            'semester.status': 'active' 
        })
        .populate('semester', 'name status startDate')
        .populate('subjects.subject', 'name code')
        .lean();

        // Get current semester grades
        const currentSemesterGrades = grades[0] || { subjects: [] };

        const formattedData = {
            success: true,
            data: {
                firstName: student.firstName || '',
                lastName: student.lastName || '',
                middleInitial: student.middleInitial || '',
                gender: student.gender || '',
                birthdate: student.birthdate || '',
                contactNumber: student.contactNumber || '',
                birthplace: {
                    province: student.birthplace?.province || '',
                    municipality: student.birthplace?.municipality || '',
                    barrio: student.birthplace?.barrio || ''
                },
                address: student.address || '',
                guardian: {
                    name: student.guardian?.name || '',
                    occupation: student.guardian?.occupation || ''
                },
                yearLevel: student.yearLevel?.name || '',
                section: student.section?.name || '',
                strand: student.strand?.name || '',
                school: {
                    name: student.school?.name || 'Tropical Village National Highschool',
                    year: student.school?.year || ''
                },
                grades: {
                    subjects: student.userData?.subjects?.map(subject => ({
                        name: subject.name || 'Unknown Subject',
                        code: subject.code || 'N/A',
                        section: student.section?.name || 'N/A',
                        yearLevel: student.yearLevel?.name || 'N/A'
                    })) || [],
                    semester: grades?.semester?.name || ''
                }
            }
        };

        // Add debug logs
        console.log('Found grades:', {
            count: grades.length,
            subjects: currentSemesterGrades.subjects?.length
        });

        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error in viewStudentProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student profile',
            error: error.message
        });
    }
});

// @desc    Get student grades
// @route   GET /api/student/grades
// @access  Private/Student
const viewStudentGrades = asyncHandler(async (req, res) => {
    try {
        // Find student and populate necessary fields
        const student = await Student.findOne({ user: req.user._id })
            .populate('strand', 'name')
            .populate('yearLevel', 'name')
            .lean();

        if (!student) {
            console.log('No student found for user:', req.user._id);
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Fetch grades with all necessary populations
        const grades = await Grade.find({ 
            student: student.user,
            semester: { $exists: true }
        })
        .populate({
            path: 'semester',
            select: 'name status startDate yearLevel',
            match: { status: { $in: ['active', 'completed', 'pending'] } },
            populate: {
                path: 'yearLevel',
                select: 'name'
            }
        })
        .populate('subjects.subject', 'name code')
        .populate('strand', 'name')
        .populate('yearLevel', 'name')
        .sort({ 'semester.yearLevel': 1, 'semester.startDate': 1 })
        .lean();

     // Group grades by year level
     const groupedGrades = grades.reduce((acc, grade) => {
        const yearLevel = grade.semester?.yearLevel?.name || "Unspecified Year";
        
        if (!acc[yearLevel]) {
            acc[yearLevel] = [];
        }

        acc[yearLevel].push({
            name: grade.semester?.name || 'Unknown Semester',
            strand: grade.strand?.name || student.strand?.name,
            yearLevel: yearLevel,
            subjects: grade.subjects.map(subj => ({
                name: subj.subject?.name || 'Unknown Subject',
                code: subj.subject?.code || 'N/A',
                midterm: subj.midterm || 0,
                finals: subj.finals || 0,
                finalRating: subj.finalRating || 0,
                action: subj.action || (subj.finalRating >= 75 ? 'PASSED' : 'FAILED')
            }))
        });

        return acc;
    }, {});

    // Convert to array format
    const formattedData = Object.entries(groupedGrades).map(([yearLevel, semesters]) => ({
        yearLevel,
        semesters: semesters.sort((a, b) => a.name.localeCompare(b.name))
    }));

    return res.status(200).json({
        success: true,
        data: formattedData
    });

} catch (error) {
    console.error('Error in viewStudentGrades:', error);
    return res.status(500).json({
        success: false,
        message: 'Error fetching grades',
        error: error.message
    });
}
});

export { viewStudentProfile, viewStudentGrades };
