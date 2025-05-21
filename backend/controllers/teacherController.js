import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Section from '../models/sectionModel.js';
import Student from '../models/studentModel.js';
import Subject from '../models/subjectModel.js';
import Semester from '../models/semesterModel.js';
import YearLevel from '../models/yearLevelModel.js';
import Grade from '../models/gradeModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import Attendance from '../models/attendanceModel.js';
import dayjs from 'dayjs';

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
        middleName,
        suffix,
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
    if (middleName) student.middleName = middleName;
    if (suffix) student.suffix = suffix;
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
            middleName: updatedStudent.middleName,
            suffix: updatedStudent.suffix,
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
            middleName,
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
            middleName,
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
  const { studentId, subjectId, semesterId, midterm, finals, section, yearLevel } = req.body;

  if (!studentId || !subjectId || !semesterId || !section || !yearLevel) {
    res.status(400);
    throw new Error('Student ID, Subject ID, Semester ID, Section, and Year Level are required');
}


  try {
        // Convert IDs to ObjectId
        const objectIdStudent = new mongoose.Types.ObjectId(studentId);
        const objectIdSubject = new mongoose.Types.ObjectId(subjectId);
        const objectIdSemester = new mongoose.Types.ObjectId(semesterId);

        const sectionRecord = await Section.findOne({ name: section }); // Assuming section name is unique
        if (!sectionRecord) {
            res.status(400);
            throw new Error("Section not found");
        }
        const objectIdSection = sectionRecord._id;
        
        const yearLevelREcord = await YearLevel.findOne({ name: yearLevel }); // Assuming section name is unique
        if (!yearLevelREcord) {
            res.status(400);
            throw new Error("Section not found");
        }
        const objectIdYearLevel = yearLevelREcord._id;


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
      schoolYear: req.body.schoolYear, // Include schoolYear if needed
      yearLevel: objectIdYearLevel,   // Include yearLevel if needed
      section: objectIdSection,       // Include section if needed
      strand: req.body.strand ,         // Include strand if needed
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
              yearLevel: objectIdYearLevel,   // Save year level
              section: objectIdSection,    // Save section
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
        console.log('Received IDs:', { studentId, subjectId, semesterId, section, yearLevel });

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
          const { studentId, subjectId, semesterId, midterm, finals, schoolYear, yearLevel, section, strand } = update;
            
            if (!studentId || !subjectId || !semesterId) {
                console.warn('Skipping update with missing required fields:', update);
                continue;
            }

            // Convert IDs to ObjectId
            const objectIdStudent = new mongoose.Types.ObjectId(studentId);
            const objectIdSubject = new mongoose.Types.ObjectId(subjectId);
            const objectIdSemester = new mongoose.Types.ObjectId(semesterId);

            const sectionRecord = await Section.findOne({ name: section }); // Assuming section name is unique
            if (!sectionRecord) {
                res.status(400);
                throw new Error("Section not found");
            }
            const objectIdSection = sectionRecord._id;
            
            const yearLevelREcord = await YearLevel.findOne({ name: yearLevel }); // Assuming section name is unique
            if (!yearLevelREcord) {
                res.status(400);
                throw new Error("Section not found");
            }
            const objectIdYearLevel = yearLevelREcord._id;

            // Calculate final rating
            const midtermValue = midterm !== undefined ? parseFloat(midterm) : 0;
            const finalsValue = finals !== undefined ? parseFloat(finals) : 0;
            const finalRating = (midtermValue * 0.4 + finalsValue * 0.6).toFixed(2);
            const action = parseFloat(finalRating) >= 75 ? 'PASSED' : 'FAILED';

            // Find existing grade including the new fields
            let grade = await Grade.findOne({
              student: objectIdStudent,
              semester: objectIdSemester,
              schoolYear,
              yearLevel: objectIdYearLevel,
              section: objectIdSection,
              strand
          });

          if (!grade) {
            // Create new grade document
            grade = new Grade({
                student: objectIdStudent,
                semester: objectIdSemester,
                schoolYear,
                yearLevel: objectIdYearLevel,
                section: objectIdSection,
                strand,
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
            schoolYear,
            yearLevel,
            section,
            strand,
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
});

// @route   PUT /api/grades/:id
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
const generateForm137 = asyncHandler(async (req, res) => {
  try {
      const { studentId } = req.params;

      // Fetch student data without grades
      const student = await Student.findById(studentId)
          .populate([
              { path: "user" },
              { path: "yearLevel" },
              { path: "section" },
              { path: "strand" }
          ])
          .lean(); // Convert to plain JSON for better performance

      if (!student) {
          res.status(404);
          throw new Error("Student not found");
      }

          const grades = await Grade.find({ student: student.user })
          .populate({
          path: "semester",
          select: "name status startDate yearLevel",
          populate: {
              path: "yearLevel",
              select: "name",
          },
          })
          .populate("subjects.subject", "name code")
          .lean();
      
      console.log("📌 Retrieved Grades (with Semester):", JSON.stringify(grades, null, 2));
      

      const admissionDate = dayjs(student.user.createdAt).format("MM/DD/YYYY");

      // Format student's full name for the filename
      const fullName = `${student.lastName || 'Unknown'}, ${student.firstName || 'Unknown'}`;
      const sanitizedFileName = fullName.replace(/[\/:*?"<>|]/g, '_');

      // Define file paths
      const templatePath = path.resolve(__dirname, "../utils/Form 137-SHS 2016.xlsx");
      const outputExcelPath = path.resolve(__dirname, `../output/Form137_${sanitizedFileName}.xlsx`);
      const fileName = `Form137_${sanitizedFileName}.xlsx`;

      console.log(`📂 Loading template from: ${templatePath}`);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);

      // Log available worksheets
      console.log("✅ Available worksheets:", workbook.worksheets.map(ws => ws.name));

      // Access worksheets safely
      const worksheetFront = workbook.getWorksheet("FRONT");
      const worksheetBack = workbook.getWorksheet("BACK");

      if (!worksheetFront || !worksheetBack) {
          throw new Error("❌ Worksheets not found in the template.");
      }

      // 🔹 Insert student details in the FRONT worksheet
      worksheetFront.getCell("F8").value = student.lastName || "N/A"; // Last Name
      worksheetFront.getCell("Y8").value = student.firstName || "N/A"; // First Name
      worksheetFront.getCell("AZ8").value = student.middleName || "N/A"; // Middle Name
      worksheetFront.getCell("C9").value = student.user.username || "N/A"; // LRN
      worksheetFront.getCell("AA9").value = student.birthdate || "N/A"; // Date of Birth
      worksheetFront.getCell("AN9").value = student.gender || "N/A"; // Sex
      worksheetFront.getCell("BH9").value = admissionDate || "N/A"; // Date of SHS Admission

      console.log("✅ Student details inserted into the form.");
       
       /// Fetch Grade 11 grades from the database
const grade11FirstSemester = await Grade.findOne({
  student: student.user
})
.populate({
  path: "semester",
  select: "name yearLevel",
  populate: {
      path: "yearLevel",
      select: "name"
  }
})
.populate({
  path: "subjects.subject",
  select: "name"
})

// **3️⃣ Insert Student Information**
      worksheetFront.getCell("E23").value = "Tropical Village National Highschool"; // School Name
      worksheetFront.getCell("AF23").value = "330921"; // School ID
      worksheetFront.getCell("AS23").value = "11"; // Grade Level
      worksheetFront.getCell("BA23").value = "2022-2023"; // SY
      worksheetFront.getCell("BK23").value = "1st"; // Semester
      worksheetFront.getCell("G25").value = student.strand.name; // Strand
      worksheetFront.getCell("AS25").value = "Current Section"; // Section

console.log("📄 Retrieved Grades:", grade11FirstSemester);
if (!grade11FirstSemester) {
  console.warn("⚠️ Warning: No grades found for the student.");
} else if (
  grade11FirstSemester.semester &&
  grade11FirstSemester.semester.yearLevel?.name === "Grade 11" &&
  grade11FirstSemester.semester.name === "1st Semester"
) {
  let rowIndex = 31; // Starting row for subjects

  if (!grade11FirstSemester.subjects || grade11FirstSemester.subjects.length === 0) {
      console.warn("⚠️ Warning: No subjects found for Grade 11 First Semester.");
  } else {
      grade11FirstSemester.subjects.forEach((subjectEntry) => {
          if (!subjectEntry.subject || !subjectEntry.subject.name) {
              console.warn("⚠️ Warning: Missing subject name for a grade entry:", subjectEntry);
              return; // Skip this entry to prevent errors
          }

          worksheetFront.getCell(`I${rowIndex}`).value = subjectEntry.subject.name; // Subject name
          worksheetFront.getCell(`AT${rowIndex}`).value = subjectEntry.midterm ?? "N/A"; // Midterm Grade
          worksheetFront.getCell(`AY${rowIndex}`).value = subjectEntry.finals ?? "N/A"; // Finals Grade

          rowIndex++;
      });
  }
} else {
  console.warn("⚠️ Warning: No grades found for Grade 11 First Semester.");
}
      

const grade11SecondSemester = await Grade.findOne({
  student: student.user
})
.populate({
  path: "semester",
  select: "name yearLevel",
  populate: {
      path: "yearLevel",
      select: "name"
  }
})
.populate({
  path: "subjects.subject",
  select: "name"
})

// **3️⃣ Insert Student Information**
worksheetFront.getCell("E66").value = "Tropical Village National Highschool"; // School Name
worksheetFront.getCell("AF66").value = "330921"; // School ID
worksheetFront.getCell("AS66").value = "11"; // Grade Level
worksheetFront.getCell("BA66").value = "2022-2023"; // SY
worksheetFront.getCell("BK66").value = "2nd"; // Semester
worksheetFront.getCell("G68").value = student.strand.name; // Strand
worksheetFront.getCell("AS68").value = "Current Section"; // Section

console.log("📄 Retrieved Grades:", grade11SecondSemester);
if (!grade11SecondSemester) {
  console.warn("⚠️ Warning: No grades found for the student.");
} else if (
  grade11SecondSemester.semester &&
  grade11SecondSemester.semester.yearLevel?.name === "Grade 11" &&
  grade11SecondSemester.semester.name === "2nd Semester"
) {
  let rowIndex = 74; // Starting row for subjects

  if (!grade11SecondSemester.subjects || grade11SecondSemester.subjects.length === 0) {
      console.warn("⚠️ Warning: No subjects found for Grade 11 Second Semester.");
  } else {
      grade11SecondSemester.subjects.forEach((subjectEntry) => {
          if (!subjectEntry.subject || !subjectEntry.subject.name) {
              console.warn("⚠️ Warning: Missing subject name for a grade entry:", subjectEntry);
              return; // Skip this entry to prevent errors
          }

          worksheetFront.getCell(`I${rowIndex}`).value = subjectEntry.subject.name; // Subject name
          worksheetFront.getCell(`AT${rowIndex}`).value = subjectEntry.midterm ?? "N/A"; // Midterm Grade
          worksheetFront.getCell(`AY${rowIndex}`).value = subjectEntry.finals ?? "N/A"; // Finals Grade

          rowIndex++;
      });
  }
} else {
  console.warn("⚠️ Warning: No grades found for Grade 11 Second Semester.");
}         
     console.log("✅ Grade 11 grades inserted.");
     
      /// Fetch Grade 12 grades from the database
      const grade12FirstSemester = await Grade.findOne({
          student: student.user
      })
      .populate({
          path: "semester",
          select: "name yearLevel",
          populate: {
              path: "yearLevel",
              select: "name"
          }
      })
      .populate({
          path: "subjects.subject",
          select: "name"
      })
      
          // **3️⃣ Insert Student Information**
          worksheetBack.getCell("E4").value = "Tropical Village National Highschool"; // School Name
          worksheetBack.getCell("AF4").value = "330921"; // School ID
          worksheetBack.getCell("AS4").value = "12"; // Grade Level
          worksheetBack.getCell("BA4").value = "2023-2024"; // SY
          worksheetBack.getCell("BK4").value = "1st"; // Semester
          worksheetBack.getCell("G5").value = student.strand.name; // Strand
          worksheetBack.getCell("AS5").value = "Current Section"; // Section


      console.log("📄 Retrieved Grades:", grade12FirstSemester);
      if (!grade12FirstSemester) {
          console.warn("⚠️ Warning: No grades found for the student.");
      } else if (
          grade12FirstSemester.semester &&
          grade12FirstSemester.semester.yearLevel?.name === "Grade 12" &&
          grade12FirstSemester.semester.name === "1st Semester"
      ) {
          let rowIndex = 11; // Starting row for subjects
      
          if (!grade12FirstSemester.subjects || grade12FirstSemester.subjects.length === 0) {
              console.warn("⚠️ Warning: No subjects found for Grade 12 First Semester.");
          } else {
              grade12FirstSemester.subjects.forEach((subjectEntry) => {
                  if (!subjectEntry.subject || !subjectEntry.subject.name) {
                      console.warn("⚠️ Warning: Missing subject name for a grade entry:", subjectEntry);
                      return; // Skip this entry to prevent errors
                  }
      
                  worksheetBack.getCell(`I${rowIndex}`).value = subjectEntry.subject.name; // Subject name
                  worksheetBack.getCell(`AT${rowIndex}`).value = subjectEntry.midterm ?? "N/A"; // Midterm Grade
                  worksheetBack.getCell(`AY${rowIndex}`).value = subjectEntry.finals ?? "N/A"; // Finals Grade
      
                  rowIndex++;
              });
          }
      } else {
          console.warn("⚠️ Warning: No grades found for Grade 12 First Semester.");
      }
      
      const grade12SecondSemester = await Grade.findOne({
          student: student.user
      })
      .populate({
          path: "semester",
          select: "name yearLevel",
          populate: {
              path: "yearLevel",
              select: "name"
          }
      })
      .populate({
          path: "subjects.subject",
          select: "name"
      })

      // **3️⃣ Insert Student Information**
      worksheetBack.getCell("E46").value = "Tropical Village National Highschool"; // School Name
      worksheetBack.getCell("AF46").value = "330921"; // School ID
      worksheetBack.getCell("AS46").value = "12"; // Grade Level
      worksheetBack.getCell("BA46").value = "2023-2024"; // SY
      worksheetBack.getCell("BK46").value = "1st"; // Semester
      worksheetBack.getCell("G48").value = student.strand.name; // Strand
      worksheetBack.getCell("AS48").value = "Current Section"; // Section
      
      console.log("📄 Retrieved Grades:", grade12SecondSemester);
      if (!grade12SecondSemester) {
          console.warn("⚠️ Warning: No grades found for the student.");
      } else if (
          grade12SecondSemester.semester &&
          grade12SecondSemester.semester.yearLevel?.name === "Grade 12" &&
          grade12SecondSemester.semester.name === "2nd Semester"
      ) {
          let rowIndex = 74; // Starting row for subjects
      
          if (!grade12SecondSemester.subjects || grade12SecondSemester.subjects.length === 0) {
              console.warn("⚠️ Warning: No subjects found for Grade 12 Second Semester.");
          } else {
              grade12SecondSemester.subjects.forEach((subjectEntry) => {
                  if (!subjectEntry.subject || !subjectEntry.subject.name) {
                      console.warn("⚠️ Warning: Missing subject name for a grade entry:", subjectEntry);
                      return; // Skip this entry to prevent errors
                  }
      
                  worksheetBack.getCell(`I${rowIndex}`).value = subjectEntry.subject.name; // Subject name
                  worksheetBack.getCell(`AT${rowIndex}`).value = subjectEntry.midterm ?? "N/A"; // Midterm Grade
                  worksheetBack.getCell(`AY${rowIndex}`).value = subjectEntry.finals ?? "N/A"; // Finals Grade
      
                  rowIndex++;
              });
          }
      } else {
          console.warn("⚠️ Warning: No grades found for Grade 12 Second Semester.");
      }         
     console.log("✅ Grade 12 grades inserted.");

     // Instead of writing the file to disk, send it as a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", `attachment; filename=Form137_${student.lastName}.xlsx`);
    res.setHeader("X-Filename", `Form137_${sanitizedFileName}.xlsx`); // Custom header for frontend
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.send(Buffer.from(buffer)); // Convert to Buffer and send
  } catch (error) {
    console.error("❌ Error generating Form 137:", error);
    res.status(500).json({ message: "Failed to generate Form 137" });
  }
});

/**
 * @desc    Get all sections assigned to the teacher
 * @route   GET /api/teacher/sections
 * @access  Private/Teacher
 */
const getTeacherSections = asyncHandler(async (req, res) => {
  try {
    // Find all sections where this teacher is assigned
    const sections = await Section.find({ teacher: req.user._id })
      .populate('yearLevel')
      .populate('strand')
      .populate('students')
      .lean();
    
    // Get the teacher's advisory section
    const teacher = await User.findById(req.user._id)
      .select('advisorySection')
      .lean();
    
    // Add debug logging
    console.log('Teacher advisory section:', teacher.advisorySection);
    console.log('Sections found:', sections.map(s => ({ 
      id: s._id.toString(), 
      name: s.name,
      studentCount: s.students?.length || 0
    })));
    
    // Format the response
    const formattedSections = sections.map(section => {
      const isAdvisory = teacher.advisorySection && 
      section._id.toString() === teacher.advisorySection.section.toString();

      // Mark students in advisory section
      const studentsWithAdvisory = (section.students || []).map(student => ({
        ...student,
        isAdvisory: isAdvisory // If the section is advisory, all students in it are advisory students
      }));
      
      return {
        _id: section._id,
        name: section.name,
        yearLevel: section.yearLevel,
        strand: section.strand,
        students: studentsWithAdvisory,
        isAdvisory: isAdvisory
      };
    });
    
    res.json(formattedSections);
  } catch (error) {
    console.error('Error fetching teacher sections:', error);
    res.status(500);
    throw new Error('Error fetching sections: ' + error.message);
  }
});

const getStudentData = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  console.log('Fetching student data for ID:', studentId); // Debug log

  try {
      // First, find the student record
      const student = await Student.findOne({ user: studentId })
          .populate({
              path: 'user',
              select: 'username sections strand yearLevel'
          })
          .populate('yearLevel')
          .populate('section')
          .populate('strand')
          .lean();

      if (!student) {
          console.log('No student found with user ID:', studentId); // Debug log
          return res.status(404).json({
              success: false,
              message: 'Student not found'
          });
      }

      console.log('Found student:', student); // Debug log

      const studentData = {
          _id: student._id,
          user: student.user._id,
          username: student.user.username,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          suffix: student.suffix,
          gender: student.gender,
          birthdate: student.birthdate,
          birthplace: student.birthplace,
          address: student.address,
          guardian: student.guardian,
          contactNumber: student.contactNumber,
          yearLevel: student.yearLevel?.name,
          section: student.section?.name,
          strand: student.strand?.name,
          school: student.school
      };

      res.status(200).json({
          success: true,
          data: studentData
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
  const { semesterId } = req.query;

  if (!semesterId) {
    return res.status(400).json({
      success: false,
      message: 'Semester ID is required'
    });
  }

  try {
    // Get the teacher with populated subjects
    const teacher = await User.findById(req.user._id)
      .populate({
        path: 'subjects',
        match: { semester: semesterId },
        select: 'name code strand yearLevel'
      })
      .lean();

    console.log('Teacher data:', {
      id: teacher._id,
      subjectsCount: teacher.subjects?.length || 0
    });

    if (!teacher.subjects || teacher.subjects.length === 0) {
      console.log('No subjects found for semester:', semesterId);
      return res.json([]);
    }

    // Format subjects
    const subjects = teacher.subjects.map(subject => ({
      _id: subject._id,
      name: subject.name,
      code: subject.code,
      strand: subject.strand,
      yearLevel: subject.yearLevel
    }));

    console.log(`Found ${subjects.length} subjects for teacher`);
    return res.json(subjects);

  } catch (error) {
    console.error('Error in getTeacherSubjects:', error);
    return res.status(500).json({
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
      // First get the teacher's sections
      const teacherSections = await Section.find({ teacher: req.user._id })
          .select('_id')
          .lean();

      const teacherSectionIds = teacherSections.map(section => section._id);

      // Find students who:
      // 1. Have the subject
      // 2. Are in the semester
      // 3. Are in one of the teacher's sections
      const students = await Student.find({
          section: { $in: teacherSectionIds }
      })
      .populate({
          path: 'user',
          match: { 
              subjects: subjectId,
              semester: semesterId 
          },
          select: 'firstName lastName'
      })
      .populate('section', 'name')
      .populate('yearLevel', 'name')
      .populate('strand', 'name')
      .lean();

      // Filter out students whose user field didn't populate (not enrolled in subject)
      const validStudents = students.filter(student => student.user);

      // Format student data
      const formattedStudents = validStudents.map(student => ({
          _id: student.user._id,
          username: `${student.firstName} ${student.lastName}`,
          sections: [{
              _id: student.section?._id,
              name: student.section?.name || 'No Section'
          }],
          strand: {
              name: student.strand?.name || 'Not Set'
          },
          yearLevel: {
              name: student.yearLevel?.name || 'Not Set'
          }
      }));

      console.log(`Found ${formattedStudents.length} students in teacher's sections`);
      res.json(formattedStudents);

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
    // Get the teacher user with populated advisorySection.section
    const teacher = await User.findById(req.user._id)
      .populate({
        path: 'advisorySection.section',
        populate: [
          { 
            path: 'yearLevel',
            select: 'name' 
          },
          { 
            path: 'strand',
            select: 'name' 
          }
        ]
      });

    if (!teacher.advisorySection?.section) {
      return res.status(404).json({
        success: false,
        message: 'No advisory section assigned'
      });
    }

    // Get the section with populated data
    const section = await Section.findById(teacher.advisorySection.section._id)
      .populate('yearLevel', 'name')
      .populate('strand', 'name')
      .populate('students');

    const response = {
      success: true,
      advisorySection: {
        _id: section._id,
        name: section.name,
        yearLevel: section.yearLevel?.name || 'Not Set',
        strand: section.strand?.name || 'Not Set',
        status: teacher.advisorySection.status,
        studentCount: section.students?.length || 0,
        adviser: `${teacher.firstName} ${teacher.lastName}`
      }
    };

    console.log('Sending advisory section data:', response);
    res.json(response);

  } catch (error) {
    console.error('Error fetching advisory class:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advisory section',
      error: error.message
    });
  }
});


// @desc    Get teacher dashboard data
// @route   GET /api/teacher/dashboard
// @access  Private (teacher only)
const getTeacherDashboard = asyncHandler(async (req, res) => {
  try {
      // Fetch teacher data with proper population
      const teacherData = await User.findById(req.user._id)
          .populate('subjects')
          .populate('sections')
          .populate({
              path: 'advisorySection.section',
              select: 'name yearLevel strand',
              populate: [
                  { path: 'yearLevel', select: 'name' },
                  { path: 'strand', select: 'name' }
              ]
          })
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

      // Format the dashboard data
      const dashboardData = {
          username: teacherData.username,
          totalStudents: uniqueStudents.size,
          totalSubjects: teacherData.subjects?.length || 0,
          totalSections: teacherData.sections?.length || 0,
          advisorySection: teacherData.advisorySection?.section ? {
              name: teacherData.advisorySection.section.name,
              yearLevel: teacherData.advisorySection.section.yearLevel?.name,
              strand: teacherData.advisorySection.section.strand?.name,
              status: teacherData.advisorySection.status
          } : null,
          sections: sections.map(section => ({
              name: section.name,
              studentCount: section.students.length,
              isAdvisory: section._id.toString() === teacherData.advisorySection?.section?._id?.toString()
          })),
          subjects: teacherData.subjects.map(subject => ({
              name: subject.name,
              section: subject.section?.name,
              schedule: subject.schedule
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
  
  try {
      const objectIdStudent = new mongoose.Types.ObjectId(studentId);
      
      // Populate subject details, semester, and year level information
      const grades = await Grade.find({ student: objectIdStudent })
          .populate({
              path: 'semester',
              select: 'name status'
          })
          .populate('yearLevel', 'name') // Add year level population
          .populate({
              path: 'subjects.subject',
              select: 'name code'
          })
          .lean();
      
      console.log('Raw grades from database:', grades);
      
      // Format grades with proper subject and year level information
      const formattedGrades = grades.map(grade => ({
          semester: grade.semester,
          yearLevel: grade.yearLevel?.name || 'Unknown Year Level',
          subjects: grade.subjects.map(subject => ({
              subject: {
                  _id: subject.subject?._id,
                  name: subject.subject?.name || 'Unknown Subject'
              },
              midterm: subject.midterm,
              finals: subject.finals,
              finalRating: subject.finalRating,
              action: subject.action
          }))
      }));

      console.log('Formatted grades:', formattedGrades);
      res.json(formattedGrades);
  } catch (error) {
      console.error('Error fetching student grades:', error);
      res.status(500);
      throw new Error('Error fetching student grades: ' + error.message);
  }
});

/**
 * @desc    Get a specific section by ID
 * @route   GET /api/teacher/sections/:id
 * @access  Private/Teacher
 */
const getSectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if the teacher is authorized to access this section
    const teacherSections = await Section.find({ teacher: req.user._id });
    const isAuthorized = teacherSections.some(s => s._id.toString() === id);
    
    if (!isAuthorized) {
      res.status(403);
      throw new Error('Not authorized to access this section');
    }
    
    // Get the section details
    const section = await Section.findById(id)
      .populate('yearLevel')
      .populate('strand');
    
    if (!section) {
      res.status(404);
      throw new Error('Section not found');
    }
    
    res.json({
      _id: section._id,
      name: section.name,
      yearLevel: section.yearLevel,
      strand: section.strand,
      adviser: req.user.username // Assuming the teacher is the adviser
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500);
    throw new Error('Error fetching section: ' + error.message);
  }
});

/**
 * @desc    Get students for a section
 * @route   GET /api/teacher/students
 * @access  Private/Teacher
 */
const getSectionStudents = asyncHandler(async (req, res) => {
  const { section } = req.query;

  if (!section) {
    res.status(400);
    throw new Error('Section ID is required');
  }

  try {
    // Check if the teacher is authorized to access this section
    const teacherSections = await Section.find({ teacher: req.user._id });
    const isAuthorized = teacherSections.some(s => s._id.toString() === section);

    if (!isAuthorized) {
      res.status(403);
      throw new Error('Not authorized to access this section');
    }

    // Get all students in this section — convert section to ObjectId
    const students = await Student.find({ section: new mongoose.Types.ObjectId(section) })
      .select('firstName lastName middleName _id')
      .sort({ lastName: 1, firstName: 1 });
      console.log(students);

    res.json(students);
  } catch (error) {
    console.error('Error fetching section students:', error);
    res.status(500);
    throw new Error('Error fetching students: ' + error.message);
  }
});

/**
 * @desc    Get attendance data for a section and month
 * @route   GET /api/teacher/attendance
 * @access  Private/Teacher
 */
const getAttendanceData = asyncHandler(async (req, res) => {
  const { section, month, semester } = req.query;

  try {
    // Get teacher's advisory section
    const teacher = await User.findById(req.user._id)
      .populate('advisorySection.section');

    // Check if teacher has an advisory section
    if (!teacher.advisorySection?.section) {
      res.status(403);
      throw new Error('Only advisory teachers can view attendance');
    }

    // Verify if the section matches teacher's advisory section
    if (teacher.advisorySection.section._id.toString() !== section) {
      res.status(403);
      throw new Error('You can only view attendance for your advisory section');
    }

    // Find attendance records
    const attendance = await Attendance.findOne({
      section,
      month,
      semester,
      teacher: req.user._id
    }).populate('records.student');

    // Return empty records if no attendance found
    if (!attendance) {
      return res.json({
        success: true,
        data: {
          records: []
        }
      });
    }

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Error in getAttendanceData:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error fetching attendance data'
    });
  }
});

/**
 * @desc    Save attendance data for a section
 * @route   POST /api/teacher/attendance
 * @access  Private/Teacher
 */
const saveAttendanceData = asyncHandler(async (req, res) => {
  try {
    const { section, month, schoolYear, semester, records } = req.body;

    // Validate required fields
    if (!section || !month || !schoolYear || !semester || !records) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get teacher's advisory section
    const teacher = await User.findById(req.user._id)
      .populate('advisorySection.section');

    // Check if teacher has an advisory section
    if (!teacher.advisorySection?.section) {
      return res.status(403).json({
        success: false,
        message: 'Only advisory teachers can manage attendance'
      });
    }

    // Verify if the section matches teacher's advisory section
    if (teacher.advisorySection.section._id.toString() !== section) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage attendance for your advisory section'
      });
    }

    // Find and update or create attendance record
    const attendanceData = {
      section,
      month,
      schoolYear,
      semester,
      teacher: req.user._id,
      records: records.map(record => ({
        student: record.student,
        weeks: {
          week1: record.weeks.week1 || {},
          week2: record.weeks.week2 || {},
          week3: record.weeks.week3 || {},
          week4: record.weeks.week4 || {},
          week5: record.weeks.week5 || {}
        },
        absent: record.absent || 0,
        tardy: record.tardy || 0,
        remarks: record.remarks || ''
      }))
    };

    // Try to find existing record first
    let attendance = await Attendance.findOne({
      section,
      month,
      schoolYear,
      semester,
      teacher: req.user._id
    });

    if (attendance) {
      // Update existing record
      attendance.records = attendanceData.records;
      attendance = await attendance.save();
    } else {
      // Create new record
      attendance = new Attendance(attendanceData);
      attendance = await attendance.save();
    }

    await attendance.populate('records.student');

    res.json({
      success: true,
      message: 'Attendance saved successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Error in saveAttendanceData:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving attendance data',
      error: error.message
    });
  }
});

const getAttendanceSummary = async (req, res) => {
  try {
    const { week = 'current', semester } = req.query;
    const teacherId = req.user._id;

    if (!semester) {
      return res.status(400).json({
        success: false,
        message: 'Semester ID is required'
      });
    }

    // Get teacher's advisory section
    const teacher = await User.findById(teacherId)
      .populate('advisorySection.section');

    if (!teacher.advisorySection?.section) {
      return res.status(400).json({
        success: false,
        message: 'No advisory section assigned'
      });
    }

    const advisorySectionId = teacher.advisorySection.section._id;

    // Calculate date range based on the selected week
    const today = new Date();
    let startDate, endDate;

    // Determine the correct start date based on the week requested
    switch (week) {
      case 'current':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1);
        break;
      case 'previous':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 6);
        break;
      case 'twoWeeksAgo':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 13);
        break;
      case 'threeWeeksAgo':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 20);
        break;
      case 'fourWeeksAgo':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 27);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1);
    }

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Format month string (YYYY-MM)
    const month = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    
    console.log('Query parameters:', {
      section: advisorySectionId,
      month,
      semester,
      teacher: teacherId
    });

    // Find attendance records for the advisory section
    const attendance = await Attendance.findOne({
      section: advisorySectionId,
      month,
      semester: new mongoose.Types.ObjectId(semester),
      teacher: teacherId
    });

    console.log('Found attendance record:', attendance);

    // Initialize daily counts
    const dailyCounts = {
      mon: { present: 0, absent: 0 },
      tue: { present: 0, absent: 0 },
      wed: { present: 0, absent: 0 },
      thu: { present: 0, absent: 0 },
      fri: { present: 0, absent: 0 },
      sat: { present: 0, absent: 0 }
    };

if (attendance && attendance.records) {
      const weekNumber = getWeekNumberInMonth(startDate);
      const weekKey = `week${weekNumber}`;

      console.log('Processing attendance for week:', weekKey);

      attendance.records.forEach(record => {
        if (record.weeks && record.weeks[weekKey]) {
          // Convert Map to object for easier handling
          const weekData = Object.fromEntries(record.weeks[weekKey]);
          
          // Process each day's attendance
          Object.entries(weekData).forEach(([day, status]) => {
            // Convert day format (M, T, W, TH, F, S) to three letter key
            let dayKey;
            switch(day) {
              case 'M': dayKey = 'mon'; break;
              case 'T': dayKey = 'tue'; break;
              case 'W': dayKey = 'wed'; break;
              case 'TH': dayKey = 'thu'; break;
              case 'F': dayKey = 'fri'; break;
              case 'S': dayKey = 'sat'; break;
              default: return; // Skip invalid days
            }

            // Count attendance
            if (status.toLowerCase() === 'present') {
              dailyCounts[dayKey].present++;
            } else if (status.toLowerCase() === 'absent') {
              dailyCounts[dayKey].absent++;
            }
          });
        }
      });
    }

    console.log('Final daily counts:', dailyCounts);

    // Get total students in the advisory section
    const section = await Section.findById(advisorySectionId)
      .populate('students');
    const totalStudents = section?.students?.length || 0;

    return res.json({
      success: true,
      data: {
        days: dailyCounts,
        dateRange: { start: startDate, end: endDate },
        totalStudents
      }
    });

  } catch (error) {
    console.error('Error getting attendance summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get attendance summary',
      error: error.message
    });
  }
};
  
  // Helper function to get the week number in the month (1-5)
  function getWeekNumberInMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = date.getDate();
  
    // Calculate adjusted start of the week (so the first week isn’t cut off)
    const adjustedDay = dayOfMonth + dayOfWeek - 1;
  
    // Calculate the week number (1-indexed)
    return Math.floor(adjustedDay / 7) + 1;
  }
  
  // Helper function to convert day abbreviation to key
  const convertDayToKey = (day) => {
    switch (day) {
      case 'M':
        return 'mon';
      case 'T':
        return 'tue';
      case 'W':
        return 'wed';
      case 'TH':
        return 'thu';
      case 'F':
        return 'fri';
      case 'S':
        return 'sat';
      default:
        return null;
    }
  };
  
const getTeacherSemesters = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get the teacher's assigned subjects with their semesters
    const teacher = await User.findById(teacherId)
      .populate({
        path: 'subjects',
        populate: {
          path: 'semester',
          select: 'name startDate endDate status yearLevel strand'
        }
      });

    if (!teacher || !teacher.subjects) {
      return res.json([]);
    }

    // Extract unique semesters from teacher's subjects
    const uniqueSemesters = teacher.subjects.reduce((semesters, subject) => {
      if (subject.semester && !semesters.some(s => s._id.toString() === subject.semester._id.toString())) {
        semesters.push({
          _id: subject.semester._id,
          name: subject.semester.name,
          status: subject.semester.status,
          startDate: subject.semester.startDate,
          endDate: subject.semester.endDate,
          yearLevel: subject.semester.yearLevel,
          strand: subject.semester.strand,
          isActive: subject.semester.status === 'active'
        });
      }
      return semesters;
    }, []);

    // Sort semesters by date (most recent first)
    uniqueSemesters.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    console.log(`Found ${uniqueSemesters.length} semesters for teacher`);
    res.status(200).json(uniqueSemesters);

  } catch (error) {
    console.error('Error in getTeacherSemesters:', error);
    res.status(500).json({
      message: 'Error fetching semesters',
      error: error.message
    });
  }
});

  const getSectionAverages = asyncHandler(async (req, res) => {
    try {
      const teacherId = req.user._id;
  
      // Get all sections taught by this teacher
      const sections = await Section.find({ teacher: teacherId })
        .select('name _id')
        .lean();
  
      const sectionAverages = await Promise.all(sections.map(async (section) => {
        // Get all grades for students in this section
        const grades = await Grade.find({
          section: section._id,
          semester: req.query.semester // Add semester filter
        }).populate('subjects.subject', 'name');
  
        // Calculate average final rating for the section
        let totalRating = 0;
        let totalSubjects = 0;
  
        grades.forEach(grade => {
          grade.subjects.forEach(subject => {
            if (subject.finalRating) {
              totalRating += subject.finalRating;
              totalSubjects++;
            }
          });
        });
  
        const average = totalSubjects > 0 ? (totalRating / totalSubjects).toFixed(2) : 0;
  
        return {
          name: section.name,
          average: parseFloat(average),
          studentCount: grades.length
        };
      }));
  
      // Sort sections by average
      sectionAverages.sort((a, b) => b.average - a.average);
  
      res.json({
        success: true,
        data: sectionAverages
      });
  
    } catch (error) {
      console.error('Error getting section averages:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating section averages'
      });
    }
  });

  const getSubjectPerformance = asyncHandler(async (req, res) => {
    try {
        const { semesterId } = req.query;
        if (!semesterId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semester ID is required' 
            });
        }

        // Get teacher's sections
        const sections = await Section.find({ teacher: req.user._id });
        const sectionIds = sections.map(section => section._id);

        console.log('Fetching grades for sections:', sectionIds);
        console.log('Semester ID:', semesterId);

        // Find all grades for these sections in the specified semester
        const grades = await Grade.find({
            semester: semesterId,
            section: { $in: sectionIds }
        })
        .populate({
            path: 'subjects.subject',
            select: 'name'
        })
        .lean();

        console.log('Found grades:', grades.length);

        // Calculate averages for each subject
        const subjectAverages = {};

        grades.forEach(grade => {
            grade.subjects.forEach(subject => {
                if (subject.subject && subject.subject.name) {
                    if (!subjectAverages[subject.subject.name]) {
                        subjectAverages[subject.subject.name] = {
                            sum: 0,
                            count: 0
                        };
                    }
                    
                    if (subject.finalRating) {
                        subjectAverages[subject.subject.name].sum += subject.finalRating;
                        subjectAverages[subject.subject.name].count += 1;
                    }
                }
            });
        });

        // Format the data for the chart
        const performanceData = Object.entries(subjectAverages)
            .map(([name, data]) => ({
                name,
                average: data.count > 0 ? Number((data.sum / data.count).toFixed(2)) : 0
            }))
            .filter(subject => subject.average > 0); // Remove subjects with no grades

        // Sort by average descending
        performanceData.sort((a, b) => b.average - a.average);

        console.log('Performance data:', performanceData);

        res.json({
            success: true,
            data: performanceData
        });

    } catch (error) {
        console.error('Error getting subject performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subject performance data'
        });
    }
});
  
  export { 
    getTeacherSemesters,
    getSubjectPerformance,
    getSectionAverages,
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
    getSectionStudents,
    getSectionById,
    getAttendanceData,
    saveAttendanceData,
    getAttendanceSummary,
    convertDayToKey,
    getWeekNumberInMonth
  };