import mongoose from 'mongoose';
import Student from './models/studentModel.js';
import User from './models/userModel.js';
import Section from './models/sectionModel.js';
import Strand from './models/strandModel.js';
import Subject from './models/subjectModel.js';
import Semester from './models/semesterModel.js'; // Import Semester model

const createPredefinedRStudent = async () => {
    try {
        // Fetch the user by username and populate associated fields
        const user = await User.findOne({ username: 'student001' })
            .populate('sections') // Populates the sections array
            .populate('strand') // Populates the strand field
            .populate({
                path: 'subjects', // Populate the subjects array
                populate: { path: 'teachers', model: 'User', select: 'username' }, // Populate teachers inside subjects
            });

        if (!user) {
            throw new Error('User not found.');
        }

        // Ensure subjects are populated correctly
        if (!user.subjects || user.subjects.length === 0) {
            throw new Error('Subjects not populated for the user.');
        }

        // Extract sections, strand, and subjects from the populated user
        const sections = user.sections; // Assuming this is an array of sections
        const strand = user.strand;
        const subjects = user.subjects;

        // Ensure at least one section and strand exist before creating the student
        if (!sections || sections.length === 0 || !strand) {
            throw new Error('Sections or Strand not found for the user.');
        }

        const firstSemester = await Semester.findById("673ffba5e2a9c5ea7906c125");
        const secondSemester = await Semester.findById("673de694adff7c2a8853f881");

        if (!firstSemester || !secondSemester) {
            throw new Error("One or both semesters could not be found.");
}

        // Predefined student data
        const studentData = {
            user: user._id,
            profileCompleted: false,
            lrn: '123456789012',
            name: 'John Doe',
            gender: 'Male',
            birthdate: new Date('2007-01-15'),
            birthplace: {
                province: 'Sorsogon',
                municipality: 'Sorsogon City',
                barrio: 'Barangay Demo',
            },
            address: '123 Demo Street, Barangay Demo, Sorsogon City',
            guardian: {
                name: 'Jane Doe',
                occupation: 'Teacher',
            },
            yearLevel: '12',
            section: sections.map(section => section._id), // Use the array of section IDs
            strand: strand._id, // Using strand's _id
            school: {
                name: 'Tropical Village National High School',
                year: '2024',
            },
            attendance: {
                totalYears: 2,
            },
            grades: [
                {
                    semester: firstSemester._id, // First semester grades
                    year: '2024',
                    subjects: subjects.map((subject) => ({
                        subject: subject._id, // Reference to Subject
                        name: subject.name,
                        midterm: 85,
                        finals: 90,
                        finalRating: 87.5,
                        action: 'PASSED',
                        teachers: subject.teachers.map(teacher => ({
                            teacherName: teacher.username, // Display teacher's username
                            teacherId: teacher._id,
                        })),
                    })),
                },
                {
                    semester: secondSemester._id, // Second semester grades
                    year: '2024',
                    subjects: subjects.map((subject) => ({
                        subject: subject._id, // Reference to Subject
                        name: subject.name,
                        midterm: 88,
                        finals: 92,
                        finalRating: 90,
                        action: 'PASSED',
                        teachers: subject.teachers.map(teacher => ({
                            teacherName: teacher.username, // Display teacher's username
                            teacherId: teacher._id,
                        })),
                    })),
                },
            ],
            contactNumber: '09123456789',
        };

        // Create the student
        const student = await Student.create(studentData);

        console.log('Predefined student created:', student);
    } catch (error) {
        console.error('Error creating predefined student:', error);
    } finally {
        mongoose.connection.close();
    }
};

export { createPredefinedRStudent };