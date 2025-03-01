import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Student from '../models/studentModel.js';
import Subject from '../models/subjectModel.js';
import Semester from '../models/semesterModel.js';
import Grade from '../models/gradeModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';

// Derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


// @desc    Fill out or update a student form
// @route   PUT /api/teachers/student/:studentId/form
// @access  Private (teacher role)
const fillOutStudentForm = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const teacherId = req.user._id; // Authenticated teacher's ID


      // First get the user to get their section
      const user = await User.findById(studentId)
      .populate('sections')
      .populate('strand')
      .populate('yearLevel')

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get the user's first section
    const userSection = user.sections?.[0];
    if (!userSection) {
        res.status(400);
        throw new Error('Student not assigned to any section');
    }

    // Fetch teacher's assigned sections
    const teacherSections = await Section.find({ teacher: teacherId });
    
    // Check if teacher is authorized for this section
    const isAuthorized = teacherSections.some(section => 
        section._id.toString() === userSection._id.toString()
    );


    if (!isAuthorized) {
        res.status(403);
        throw new Error('Not authorized to update this student');
    }


    // Find the student record
    const student = await Student.findOne({ user: studentId });
    if (!student) {
        res.status(404);
        throw new Error('Student record not found');
    }


    // Update fields based on the student model
    const {
        firstName,
        lastName,
        middleInitial,
        gender,
        birthdate,
        birthplace,
        address,
        guardian,
        school,
        attendance,
        contactNumber,
    } = req.body;

    // Update basic information

    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (middleInitial) student.middleInitial = middleInitial;
    if (gender) student.gender = gender;
    if (birthdate) student.birthdate = birthdate;
    if (birthplace) student.birthplace = birthplace;
    if (address) student.address = address;
    if (guardian) student.guardian = { ...student.guardian, ...guardian };
    if (school) student.school = { ...student.school, ...school };
    if (attendance) student.attendance = { ...student.attendance, ...attendance };
    if (contactNumber) student.contactNumber = contactNumber;

    // Update academic information from the User model
    student.yearLevel = user.yearLevel?._id;
    student.section = user.sections?.[0]?._id;
    student.strand = user.strand?._id;

    // Save the student
    await student.save();

    // Fetch the updated student with populated fields
    const updatedStudent = await Student.findOne({ user: studentId })
        .populate('yearLevel')
        .populate('section')
        .populate('strand');

    res.status(200).json({
        success: true,
        message: 'Student profile updated successfully',
        student: {
            firstName: updatedStudent.firstName,
            lastName: updatedStudent.lastName,
            middleInitial: updatedStudent.middleInitial,
            gender: updatedStudent.gender,
            birthdate: updatedStudent.birthdate,
            birthplace: updatedStudent.birthplace,
            address: updatedStudent.address,
            guardian: updatedStudent.guardian,
            school: updatedStudent.school,
            attendance: updatedStudent.attendance,
            contactNumber: updatedStudent.contactNumber,
            yearLevel: updatedStudent.yearLevel?.name,
            section: updatedStudent.section?.name,
            strand: updatedStudent.strand?.name,
        }

    });
});


// @desc    Get grades for a specific student
// @route   GET /api/grades/student/:studentId
// @access  Private (teacher role)
const getGradesByStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to view grades');
    }

    // Verify if the teacher is assigned to the same section as the student
    const teacherSections = await Section.find({ teacherId: req.user._id });
    const student = await User.findById(studentId).populate('sectionId'); // Ensure section info is populated

    if (!student || student.role !== 'student' || !student.isActive) {
        res.status(404);
        throw new Error('Current student not found or inactive');
    }

    // Check if the student is in any of the teacher's sections
    const isAssignedToSection = teacherSections.some(section => section._id.equals(student.sectionId._id));

    if (!isAssignedToSection) {
        res.status(403);
        throw new Error('Not authorized to view grades for this student');
    }

    // Fetch grades for the active student
    const grades = await Grade.find({ studentId }).populate('subject').sort({ year: 1 });

    if (!grades.length) {
        res.status(404);
        throw new Error('No grades found for this student');
    }

    res.json(grades);
});

// @desc    Import students from Excel file
// @route   POST /api/teachers/student/import
// @access  Private (teacher role)
const importStudents = asyncHandler(async (req, res) => {
    // Check if the file is uploaded
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer); // Load the Excel file from the buffer

    // Access the first sheet in the Excel workbook
    const worksheet = workbook.worksheets[0];

    const students = [];

    // Iterate over each row in the worksheet
    worksheet.eachRow((row, rowIndex) => {
        // Skip the first row if it's the header row
        if (rowIndex === 1) return;

        // Get the data from each row
        const [
            firstName,
            lastName,
            middleInitial,
            gender,
            birthdate,
            province,
            municipality,
            barrio,
            address,
            guardianName,
            guardianOccupation,
            yearLevel,
            sectionId,
            strandId,
            schoolName,
            schoolYear,
            totalYears,
            contactNumber,
        ] = row.values; // Use row.values to get the values from the current row

        // Validate required fields (simplified example)
        if (!firstName || !lastName || !gender || !birthdate || !yearLevel) {
            return; // Skip invalid rows
        }

        // Push the student data into the students array
        students.push({
            firstName,
            lastName,
            middleInitial,
            gender,
            birthdate: new Date(birthdate),
            birthplace: { province, municipality, barrio },
            address,
            guardian: { name: guardianName, occupation: guardianOccupation },
            yearLevel,
            section: sectionId,
            strand: strandId,
            school: { name: schoolName, year: schoolYear },
            attendance: { totalYears },
            contactNumber,
        });
    });

    // Insert the students into the database
    await Student.insertMany(students);

    res.status(201).json({ message: 'Students imported successfully' });
});


const addGrade = asyncHandler(async (req, res) => {
    const { studentId, subjectId, semesterId, midterm, finals } = req.body;

    // Validate required fields
    if (!studentId || !subjectId || !semesterId) {
    res.status(400);
        throw new Error('Student ID, Subject ID, and Semester ID are required');
  }

  try {
        // Convert IDs to ObjectId
        const objectIdStudent = new mongoose.Types.ObjectId(studentId);
        const objectIdSubject = new mongoose.Types.ObjectId(subjectId);
        const objectIdSemester = new mongoose.Types.ObjectId(semesterId);

        // Calculate final rating (40% midterm, 60% finals)
        const midtermValue = midterm !== undefined ? parseFloat(midterm) : 0;
        const finalsValue = finals !== undefined ? parseFloat(finals) : 0;
        const finalRating = (midtermValue * 0.4 + finalsValue * 0.6).toFixed(2);
        
        // Determine if passed or failed (75 is passing)
        const action = parseFloat(finalRating) >= 75 ? 'PASSED' : 'FAILED';

        // Find existing grade for this student, semester, and subject
    let grade = await Grade.findOne({
            student: objectIdStudent,
            semester: objectIdSemester,
            'subjects.subject': objectIdSubject
        });

        let result;

        if (grade) {
            // Update existing grade
            const subjectIndex = grade.subjects.findIndex(
                s => s.subject.toString() === subjectId
            );

            if (subjectIndex !== -1) {
                // Update existing subject
                if (midterm !== undefined) grade.subjects[subjectIndex].midterm = midtermValue;
                if (finals !== undefined) grade.subjects[subjectIndex].finals = finalsValue;
                grade.subjects[subjectIndex].finalRating = parseFloat(finalRating);
                grade.subjects[subjectIndex].action = action;
            } else {
                // Add new subject
                grade.subjects.push({
                    subject: objectIdSubject,
                    midterm: midtermValue,
                    finals: finalsValue,
                    finalRating: parseFloat(finalRating),
                    action
                });
            }

            result = await grade.save();
        } else {
            // Create new grade
            grade = new Grade({
                student: objectIdStudent,
                semester: objectIdSemester,
                subjects: [{
                    subject: objectIdSubject,
                    midterm: midtermValue,
                    finals: finalsValue,
                    finalRating: parseFloat(finalRating),
                    action
                }]
            });

            result = await grade.save();
        }

        // Log the saved grade for debugging
        console.log('Saved grade:', {
            id: result._id,
            student: result.student.toString(),
            semester: result.semester.toString(),
            subjectCount: result.subjects.length
        });

    res.status(200).json({
      success: true,
            message: 'Grade added successfully',
      data: {
                midterm: midtermValue,
                finals: finalsValue,
                finalRating,
                action
      }
    });
  } catch (error) {
        console.error('Error adding grade:', error);
    res.status(500);
        throw new Error('Error adding grade: ' + error.message);
  }
});


const bulkAddGrades = asyncHandler(async (req, res) => {
    try {
        const updates = req.body.updates;
        console.log('Received bulk updates:', updates);

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid updates provided'
            });
        }

        let updatedGrades = [];

        for (const update of updates) {
            const { studentId, subjectId, semesterId, midterm, finals } = update;
            
            if (!studentId || !subjectId || !semesterId) {
                console.warn('Skipping update with missing required fields:', update);
                continue;
            }

            // Convert IDs to ObjectId
            const objectIdStudent = new mongoose.Types.ObjectId(studentId);
            const objectIdSubject = new mongoose.Types.ObjectId(subjectId);
            const objectIdSemester = new mongoose.Types.ObjectId(semesterId);

            // Calculate final rating
            const midtermValue = midterm !== undefined ? parseFloat(midterm) : 0;
            const finalsValue = finals !== undefined ? parseFloat(finals) : 0;
            const finalRating = (midtermValue * 0.4 + finalsValue * 0.6).toFixed(2);
            const action = parseFloat(finalRating) >= 75 ? 'PASSED' : 'FAILED';

            // Find existing grade for this student, semester, and subject
            let grade = await Grade.findOne({
                student: objectIdStudent,
                semester: objectIdSemester,
                'subjects.subject': objectIdSubject
            });

            if (!grade) {
                // Create new grade document
                grade = new Grade({
                    student: objectIdStudent,
                    semester: objectIdSemester,
                    subjects: [{
                        subject: objectIdSubject,
                        midterm: midtermValue,
                        finals: finalsValue,
                        finalRating: parseFloat(finalRating),
                        action
                    }]
                });
            } else {
                // Find the subject in the subjects array
                const subjectIndex = grade.subjects.findIndex(
                    s => s.subject.toString() === subjectId
                );

                if (subjectIndex !== -1) {
                    // Update existing subject
                    if (midterm !== undefined) grade.subjects[subjectIndex].midterm = midtermValue;
                    if (finals !== undefined) grade.subjects[subjectIndex].finals = finalsValue;
                    grade.subjects[subjectIndex].finalRating = parseFloat(finalRating);
                    grade.subjects[subjectIndex].action = action;
                } else {
                    // Add new subject
                    grade.subjects.push({
                        subject: objectIdSubject,
                        midterm: midtermValue,
                        finals: finalsValue,
                        finalRating: parseFloat(finalRating),
                        action
                    });
                }
            }

            // Save the grade
            await grade.save();
            
            // Add to updated grades
            updatedGrades.push({
                studentId,
                subjectId,
                midterm: midtermValue,
                finals: finalsValue,
                finalRating,
                action
            });
        }

        console.log(`Successfully updated ${updatedGrades.length} grades`);

        // Send response
        res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedGrades.length} grades`,
            updatedGrades
        });

    } catch (error) {
        console.error('Error in bulkAddGrades:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add grades',
            error: error.message
        });
    }
});// @route   PUT /api/grades/:id
// @access  Private (teacher role)
const updateGrade = async (req, res) => {
    try {
        const { studentId, subjectId, gradeType, gradeValue, semesterId } = req.body;

        // Find the student's grade document
        let studentGrade = await Grade.findOne({
            student: studentId,
            semester: semesterId
        });

        if (!studentGrade) {
            // Create new grade document if it doesn't exist
            studentGrade = new Grade({
                student: studentId,
                semester: semesterId,
                subjects: []
            });
        }

        // Find the subject in the grades array
        const subjectIndex = studentGrade.subjects.findIndex(
            s => s.subject.toString() === subjectId
        );

        if (subjectIndex === -1) {
            // Add new subject grade if it doesn't exist
            studentGrade.subjects.push({
                subject: subjectId,
                [gradeType]: gradeValue
            });
        } else {
            // Update existing subject grade
            studentGrade.subjects[subjectIndex][gradeType] = gradeValue;
        }

        // Calculate final rating and action
        const subject = studentGrade.subjects[subjectIndex] || studentGrade.subjects[studentGrade.subjects.length - 1];
        if (subject.midterm !== undefined && subject.finals !== undefined) {
            subject.finalRating = (subject.midterm + subject.finals) / 2;
            subject.action = subject.finalRating >= 75 ? 'Passed' : 'Failed';
        }

        // Save with { new: true } to return updated document
        const updatedGrade = await studentGrade.save();

        res.json({
            success: true,
            data: {
                finalRating: subject.finalRating,
                action: subject.action
            }
        });

    } catch (error) {
        console.error('Grade update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a grade for a student
// @route   DELETE /api/grades/:id
// @access  Private (teacher role)
const deleteGrade = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the grade ID from the URL

    // Check if the user making the request is a teacher
    if (req.user.role !== 'teacher') {
        res.status(403);
        throw new Error('Not authorized to delete grades');
    }

    // Find the grade to delete
    const existingGrade = await Grade.findById(id);

    if (!existingGrade) {
        res.status(404);
        throw new Error('Grade not found');
    }

    // Delete the grade
    await existingGrade.remove();

    res.json({ message: 'Grade removed' });
});


// @desc    Generate Form 137 for a student
// @route   GET /api/grades/form137/:studentId
// @access  Private (teacher role)

// @desc    Generate Form 137 for a student
// @route   GET /api/grades/form137/:studentId
// @access  Private (teacher role)

const generateForm137 = asyncHandler(async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Fetch the student data with necessary relationships populated
        const student = await Student.findById(studentId)
        .populate([
            { path: 'user' },
            { path: 'yearLevel' },
            { path: 'section' },
            { path: 'strand' },
            {
                path: 'grades',
                populate: [
                    { path: 'semester' },
                    { path: 'subjects.subject', model: 'Subject' }
                ]
            }
        ])
        .lean();

        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }

        // Compute full name dynamically
        const fullName = `${student.firstName} ${student.middleInitial ? student.middleInitial + '.' : ''} ${student.lastName}`.trim();
        const sanitizedStudentName = fullName.replace(/[\/\\?%*:|"<>]/g, '_');

        // Set up PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        const pdfDirectory = path.join(__dirname, '../../pdfs');

        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        const filePath = path.join(pdfDirectory, `form137-${sanitizedStudentName}.pdf`);
        const writeStream = fs.createWriteStream(filePath);

        // Configure PDF response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=form137-${sanitizedStudentName}.pdf`);

        doc.pipe(res);
        doc.pipe(writeStream);

        // Start PDF content
        doc.font('Helvetica');

        // Header Section
        const leftImagePath = path.join(__dirname, '../../frontend/img/DepED.png');
        const rightImagePath = path.join(__dirname, '../../frontend/img/TVNHS.png');

        if (fs.existsSync(leftImagePath)) {
            doc.image(leftImagePath, 95, 20, { width: 65, height: 65 });
        } else {
            console.error('Left image not found:', leftImagePath);
        }
        
        // Right image
        if (fs.existsSync(rightImagePath)) {
            doc.image(rightImagePath, 455, 20, { width: 65, height: 65 });
        } else {
            console.error('Right image not found:', rightImagePath);
        }
  
        doc.fontSize(16).text('Republic of the Philippines', 50, 20, { align: 'center' });
        doc.fontSize(14).text('Department of Education', 50, 40, { align: 'center' });
        doc.fontSize(12).text('Senior High School Student Permanent Record', 50, 60, { align: 'center' });
        doc.moveDown();

        doc.fontSize(15).text('Learner Information', 225, 100, { underline: true });
        doc.moveDown();

        const drawField = (label, value, x, y, width = 100) => {
            doc.fontSize(9).text(label, x, y, { width });
            doc.rect(x + width - 55, y - 2, 210, 12).stroke();
            doc.text(value || '', x + width - 50, y, { width: 200 });
        };

        let startY = doc.y;

        // Replace LRN with user.username
        drawField('LRN', student.user.username || 'N/A', 30, startY);
        drawField('Name', fullName || 'N/A', 305, startY);
        drawField('Strand', student.strand?.name || 'N/A', 30, startY + 20);
        drawField('Year Level', student.yearLevel?.name || 'N/A', 305, startY + 20);
        drawField('Section', student.section?.name || 'N/A', 30, startY + 40);
        drawField('Address', student.address || 'N/A', 305, startY + 40);

        doc.fontSize(15).text('Scholastic Grades\n', 220, 285, { underline: true });

        const drawSemesterTable = (semesterTitle, semesterGrades) => {
            doc.moveDown();

            // Center the semester title
            const titleWidth = doc.widthOfString(semesterTitle);
            const xPosition = 225;
            doc.fontSize(10).text(semesterTitle, xPosition, doc.y, { underline: true });

            const tableTop = doc.y + 10;
            const tableWidth = 400;
            const columnWidth = tableWidth / 4;

            // Draw table headers with centered alignment
            doc.fontSize(9)
                .text('Subject', 30, tableTop, { width: columnWidth, align: 'center' })
                .text('Midterm', 30 + 2 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
                .text('Finals', 30 + 3 * columnWidth, tableTop, { width: columnWidth, align: 'center' })
                .text('Final Rating', 30 + 4 * columnWidth, tableTop, { width: columnWidth, align: 'center' });

            let currentY = tableTop + 20;

            if (!semesterGrades || semesterGrades.length === 0) {
                doc.fontSize(10).text('No grades available.', { align: 'center' });
            } else {
                // Loop through subjects and draw rows
                semesterGrades.forEach((grade) => {
                    grade.subjects.forEach((subject) => {
                        doc.fontSize(9)
                            .text(subject.subject.name || 'N/A', 30, currentY, { width: columnWidth, align: 'center' })
                            .text(subject.midterm || 'N/A', 30 + 2 * columnWidth, currentY, { width: columnWidth, align: 'center' })
                            .text(subject.finals || 'N/A', 30 + 3 * columnWidth, currentY, { width: columnWidth, align: 'center' })
                            .text(subject.finalRating || 'N/A', 30 + 4 * columnWidth, currentY, { width: columnWidth, align: 'center' });
                        currentY += 20;
                    });
                });
            }
            doc.moveDown();
        };

        // Filter grades by semester
        const firstSemesterGrades = student.grades?.filter((grade) => grade.semester?.name === '1st Semester') || [];
        const secondSemesterGrades = student.grades?.filter((grade) => grade.semester?.name === '2nd Semester') || [];

        drawSemesterTable('Semester: 1st Semester', firstSemesterGrades);
        drawSemesterTable('Semester: 2nd Semester', secondSemesterGrades);

        doc.end();

        writeStream.on('finish', () => {
            console.log(`Form 137 saved to: ${filePath}`);
        });

        writeStream.on('error', (err) => {
            console.error('Error writing PDF to file:', err);
            res.status(500).send('Error generating the PDF.');
        });

    } catch (error) {
        if (!res.headersSent) {
            next(error);
        } else {
            console.error('Error occurred during PDF generation:', error);
        }
    }

});

const getTeacherSections = asyncHandler(async (req, res) => {
    try {
        const [sections, teacherData] = await Promise.all([
            Section.find({ teacher: req.user._id })
                .populate({
                    path: 'students',
                    model: 'User',
                    select: 'username yearLevel strand sections' 
                })
                .populate({
                    path: 'yearLevel',
                    select: 'name'
                })
                .populate({
                    path: 'strand',
                    select: 'name'
                })
                .lean(),
            
            User.findById(req.user._id)
                .populate('advisorySection')
                .lean()
        ]);

        // Check if sections exist
        if (!sections || sections.length === 0) {
            return res.status(200).json([]);
        }

        // Format the sections data
        const formattedSections = sections.map(section => ({
            ...section,
            students: section.students.map(student => ({
                _id: student._id,
                username: student.username,
                yearLevel: student.yearLevel || 'Not Set',
                strand: section.strand?.name || 'Not Set',
                sectionName: section.name,
                isAdvisory: teacherData.advisorySection?._id.toString() === section._id.toString()
            }))
        }));

        console.log('Formatted sections:', JSON.stringify(formattedSections, null, 2)); // Debug log

        res.status(200).json(formattedSections);
    } catch (error) {
        console.error('Error fetching teacher sections:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching sections',
            error: error.message 
        });
    }
});

const getStudentData = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    try {
        
        const student = await Student.findOne({ user: studentId })
            .populate('user')
            .populate('yearLevel')
            .populate('section')
            .populate('strand')
            .populate({
                path: 'grades',
                populate: { path: 'semester' },
                populate: { path: 'subjects.subject', model: 'Subject' }
            })
            .lean();

        // Also get the user data to get yearLevel
        const user = await User.findById(studentId)
            .populate('yearLevel')
            .populate('sections')
            .populate('strand');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
          // Combine User and Student profile data
    const studentData = {
        ...student,
        ...student.studentProfile,
        username: student.username
    };

    res.json(studentData);

        // Format the date to YYYY-MM-DD for the input field
        const formattedBirthdate = student.birthdate ? 
            new Date(student.birthdate).toISOString().split('T')[0] : '';

            res.status(200).json({
                success: true,
                student: {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    middleInitial: student.middleInitial,
                    gender: student.gender || '',  // Ensure gender is included
                    birthdate: formattedBirthdate,  // Format the date
                    birthplace: {
                        province: student.birthplace?.province || '',
                        municipality: student.birthplace?.municipality || '',
                        barrio: student.birthplace?.barrio || ''
                    },
                    address: student.address,
                    guardian: {
                        name: student.guardian?.name || '',
                        occupation: student.guardian?.occupation || ''
                    },
                    school: {
                        name: student.school?.name || '',
                        year: student.school?.year || ''
                    },
                    attendance: {
                        totalYears: student.attendance?.totalYears || ''
                    },
                    contactNumber: student.contactNumber,
                    // Academic info
                    yearLevel: 
                    student.yearLevel?.name || 
                    user?.yearLevel?.name || 
                    student.yearLevel || 
                    user?.yearLevel || 
                    '',
                section: 
                    student.section?.name || 
                    user?.sections?.[0]?.name || 
                    student.section || 
                    user?.sections?.[0] || 
                    '',
                strand: 
                    student.strand?.name || 
                    user?.strand?.name || 
                    student.strand || 
                    user?.strand || 
                    '',
                }
            });
        } catch (error) {
            console.error('Error fetching student data:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching student data',
                error: error.message
            });
        }
    });

// @desc    Get teacher's subjects
// @route   GET /api/teacher/subjects
// @access  Private (teacher only)
const getTeacherSubjects = asyncHandler(async (req, res) => {
    const { semesterId } = req.query; // Get semester from query params

    // Validate semesterId
    if (!semesterId) {
        return res.status(400).json({
            success: false,
            message: 'Semester ID is required'
        });
    }

    try {
        // Get teacher's subjects filtered by semester
        const teacherData = await User.findById(req.user._id)
            .populate({
                path: 'subjects',
                match: { semester: semesterId }, 
                select: 'name semester _id'
            })
            .select('subjects')
            .lean();

        if (!teacherData) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Return subjects or empty array
        const subjects = teacherData.subjects || [];

        console.log('Fetched Subjects:', subjects); // Debug log

        res.status(200).json(subjects);
        
    } catch (error) {
        console.error('Error in getTeacherSubjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
});

// @desc    Get students for a specific subject and semester
// @route   GET /api/teacher/subject-students
// @access  Private (teacher only)
const getSubjectStudents = asyncHandler(async (req, res) => {
    const { subjectId, semesterId } = req.query;

    if (!subjectId || !semesterId) {
        res.status(400);
        throw new Error('Subject ID and Semester ID are required');
    }

    try {
        // Get the teacher's advisory section
        const teacher = await User.findById(req.user._id)
            .populate('advisorySection')
            .lean();

        const advisorySectionId = teacher.advisorySection?._id;

        // Find the subject
        const subject = await Subject.findById(subjectId)
            .populate('strand')
            .populate('yearLevel');

        if (!subject) {
            res.status(404);
            throw new Error('Subject not found');
        }

        // Get students
        const students = await User.find({
            role: 'student',
            subjects: subjectId,
            semester: semesterId,
            strand: subject.strand._id,
            yearLevel: subject.yearLevel._id
        })
        .populate({
            path: 'sections',
            select: 'name _id'
        })
        .populate('strand')
        .populate('yearLevel')
        .select('username sections strand yearLevel');

        // Map students with advisory information
        const studentsWithAdvisory = students.map(student => ({
            _id: student._id,
            username: student.username,
            sections: student.sections,
            strand: student.strand,
            yearLevel: student.yearLevel,
            // Check if any of the student's sections match the teacher's advisory section
            isAdvisory: student.sections.some(section => 
                section._id.toString() === advisorySectionId?.toString()
            )
        }));

        console.log('Students with advisory:', studentsWithAdvisory); // Debug log
        res.json(studentsWithAdvisory);

    } catch (error) {
        console.error('Error:', error);
        res.status(500);
        throw new Error('Error fetching subject students: ' + error.message);
    }
});


// @desc    Get grades for students in a subject
// @route   GET /api/teacher/grades/:subjectId
// @access  Private (teacher only)
const getSubjectGrades = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { semesterId } = req.query;

    if (!subjectId || !semesterId) {
        res.status(400);
        throw new Error('Subject ID and Semester ID are required');
    }

    try {
        console.log(`Finding grades for subject: ${subjectId}, semester: ${semesterId}`);
        
        // Convert both IDs to ObjectId to ensure proper matching
        const objectIdSubject = new mongoose.Types.ObjectId(subjectId);
        const objectIdSemester = new mongoose.Types.ObjectId(semesterId);
        
        // Find all grades for the given semester that contain the subject
        const grades = await Grade.find({
            semester: objectIdSemester,
            "subjects.subject": objectIdSubject
        });

        console.log(`Found ${grades.length} grade records`);
        
        // Format the response
        const formattedGrades = {};
        
        for (const grade of grades) {
            // Find the subject entry in the subjects array
                const subjectGrade = grade.subjects.find(
                s => s.subject && s.subject.toString() === subjectId
            );
            
            if (!subjectGrade) {
                console.log(`No matching subject found in grade ${grade._id}`);
                continue;
            }
            
            // Use student ID directly from the grade document
            const studentId = grade.student.toString();
            
            // Initialize student entry if it doesn't exist
            if (!formattedGrades[studentId]) {
                formattedGrades[studentId] = {};
            }
            
            // Add the subject grades
            formattedGrades[studentId][subjectId] = {
                midterm: subjectGrade.midterm,
                finals: subjectGrade.finals,
                finalRating: subjectGrade.finalRating,
                action: subjectGrade.action
            };
        }

        console.log('Sending formatted grades:', Object.keys(formattedGrades).length);
        res.json(formattedGrades);
    } catch (error) {
        console.error('Error in getSubjectGrades:', error);
        res.status(500);
        throw new Error('Error fetching grades: ' + error.message);
    }
});

const getTeacherAdvisoryClass = asyncHandler(async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id })
            .populate({
                path: 'advisoryClass',
                populate: {
                    path: 'yearLevel',
                    select: 'name'
                }
            })
            .populate('yearLevel')
            .lean();

        if (!teacher || !teacher.advisoryClass) {
            return res.status(404).json({
                success: false,
                message: 'No advisory class found for this teacher'
            });
        }

        // Add more detailed logging
        console.log('Teacher Advisory Class:', {
            advisoryClass: teacher.advisoryClass,
            yearLevel: teacher.advisoryClass?.yearLevel
        });

        res.status(200).json({
            success: true,
            advisoryClassId: teacher.advisoryClass._id,
            advisoryClassName: teacher.advisoryClass.name,
            yearLevel: teacher.advisoryClass.yearLevel?.name
        });
    } catch (error) {
        console.error('Error fetching teacher advisory class:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching advisory class information',
            errorDetails: error.message
        });
    }
});


// @desc    Get teacher dashboard data
// @route   GET /api/teacher/dashboard
// @access  Private (teacher only)
const getTeacherDashboard = asyncHandler(async (req, res) => {
    try {
        // Get teacher data with populated fields
        const teacherData = await User.findById(req.user._id)
            .populate('subjects')
            .populate('sections')
            .populate('advisorySection')
            .populate('semesters')
            .lean();

        if (!teacherData) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Get all students from teacher's sections
        const sections = await Section.find({ 
            _id: { $in: teacherData.sections }
        }).populate('students');

        // Calculate total unique students
        const uniqueStudents = new Set();
        sections.forEach(section => {
            section.students.forEach(student => {
                uniqueStudents.add(student._id.toString());
            });
        });

        // Get today's schedule
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Format the dashboard data
        const dashboardData = {
            username: teacherData.username,
            totalStudents: uniqueStudents.size,
            totalSubjects: teacherData.subjects?.length || 0,
            totalSections: teacherData.sections?.length || 0,
            advisorySection: teacherData.advisorySection?.name || 'None',
            sections: sections.map(section => ({
                name: section.name,
                studentCount: section.students.length,
                isAdvisory: section._id.equals(teacherData.advisorySection?._id)
            })),
            subjects: teacherData.subjects.map(subject => ({
                name: subject.name,
                section: subject.section?.name,
                schedule: subject.schedule // Assuming you have schedule in your subject model
            })),
            currentSemester: teacherData.semesters?.[teacherData.semesters.length - 1]?.name
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Error fetching teacher dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});
  

// Add this new controller function
const getStudentGrades = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    
    if (!studentId) {
        res.status(400);
        throw new Error('Student ID is required');
    }
    
    try {
        // Convert studentId to ObjectId
        const objectIdStudent = new mongoose.Types.ObjectId(studentId);
        
        // Find all grades for this student
        const grades = await Grade.find({ student: objectIdStudent })
            .populate('semester')
            .populate({
                path: 'subjects.subject',
                model: 'Subject',
                select: 'name'
            })
            .lean();
        
        console.log(`Found ${grades.length} grade records for student ${studentId}`);
        
        // Format the grades for easier consumption by the frontend
        const formattedGrades = grades.map(grade => {
            return {
                _id: grade._id,
                semester: grade.semester?.name || 'Unknown Semester',
                semesterId: grade.semester?._id || null,
                subjects: grade.subjects.map(subject => ({
                    subjectId: subject.subject?._id || null,
                    subjectName: subject.subject?.name || 'Unknown Subject',
                    midterm: subject.midterm,
                    finals: subject.finals,
                    finalRating: subject.finalRating,
                    action: subject.action
                }))
            };
        });
        
        res.json(formattedGrades);
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.status(500);
        throw new Error('Error fetching student grades: ' + error.message);
    }
});


export { 
    getGradesByStudent, 
    addGrade, 
    updateGrade, 
    deleteGrade, 
    generateForm137, 
    getTeacherDashboard,
    fillOutStudentForm,
    importStudents,
    getTeacherSections,
    getStudentData,
    getTeacherSubjects,
    getSubjectStudents,
    getSubjectGrades,
    getTeacherAdvisoryClass,
    bulkAddGrades, 
    getStudentGrades,
};