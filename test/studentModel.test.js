const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Student = require('../backend/models/studentModel');
const User = require('../backend/models/userModel');
const Semester = require('../backend/models/semesterModel');
const Subject = require('../backend/models/subjectModel');
const YearLevel = require('../backend/models/yearlevelModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();
    await Student.deleteMany();
    await Semester.deleteMany();
    await Subject.deleteMany();
    await YearLevel.deleteMany();
});

describe('🧪 Student Model Test Suite', () => {
    test('✅ Should create a student successfully', async () => {
        const user = await User.create({ username: 'john_doe', password: 'hashedpass', role: 'student' });
        const semester = await Semester.create({ name: 'First Semester' });
        const yearLevel = await YearLevel.create({ name: 'Grade 11' });

        const student = await Student.create({
            user: user._id,
            firstName: 'John',
            lastName: 'Doe',
            middleInitial: 'A',
            gender: 'Male',
            birthdate: new Date('2005-08-12'),
            address: '123 Main St',
            contactNumber: '09123456789',
            semester: semester._id, // ✅ Now included
            yearLevel: yearLevel._id, // ✅ Now included
        });

        expect(student.firstName).toBe('John');
        expect(student.gender).toBe('Male');
        expect(student.user.toString()).toBe(user._id.toString());
        expect(student.yearLevel.toString()).toBe(yearLevel._id.toString()); // ✅ Check yearLevel exists
    });

    test('❌ Should not allow duplicate users', async () => {
        const user = await User.create({ username: 'jane_doe', password: 'hashedpass', role: 'student' });
        const semester = await Semester.create({ name: 'First Semester' });
        const yearLevel = await YearLevel.create({ name: 'Grade 11' });

        await Student.create({
            user: user._id,
            firstName: 'Jane',
            lastName: 'Doe',
            semester: semester._id,
            yearLevel: yearLevel._id, // ✅ Required field
        });

        await expect(
            Student.create({
                user: user._id, // Reusing the same user ID
                firstName: 'Duplicate',
                lastName: 'User',
                semester: semester._id,
                yearLevel: yearLevel._id, // ✅ Required field
            })
        ).rejects.toThrow();
    });

    test('✅ Should allow adding grades for a student', async () => {
        const user = await User.create({ username: 'student1', password: 'hashedpass', role: 'student' });
        const semester = await Semester.create({ name: 'First Semester' });
        const subject = await Subject.create({ name: 'Mathematics' });
        const yearLevel = await YearLevel.create({ name: 'Grade 10' });

        const student = await Student.create({
            user: user._id,
            firstName: 'Alex',
            lastName: 'Smith',
            semester: semester._id, // ✅ Required field
            yearLevel: yearLevel._id, // ✅ Required field
            grades: [
                {
                    semester: semester._id,
                    subjects: [
                        {
                            subject: subject._id,
                            midterm: 85,
                            finals: 90,
                            finalRating: 88,
                            action: 'PASSED',
                        },
                    ],
                },
            ],
        });

        expect(student.grades.length).toBe(1);
        expect(student.grades[0].subjects[0].finalRating).toBe(88);
        expect(student.grades[0].subjects[0].action).toBe('PASSED');
        expect(student.semester.toString()).toBe(semester._id.toString());
    });
});
