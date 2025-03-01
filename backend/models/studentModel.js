const mongoose = require('mongoose');

const studentSchema = mongoose.Schema(
    {
        // Link to User model for authentication
          // Keep only user as required
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
            // required: true removed
        },
        middleName: {

            type: String,
        },
        middleInitial: {
            type: String, // Middle initial is optional
            maxlength: 1,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'male', 'female'], // Allow both cases
            set: value => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() // Capitalize first letter
        },
        birthdate: {
            type: Date,
        },
        birthplace: {
            province: String,   
            municipality: String,
            barrio: String,
        },
        address: {
            type: String,
        },
        guardian: {
            name: {
                type: String,
            },
            occupation: String,
        },
        yearLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'YearLevel',
            required: false

        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
            required: false
        },
        strand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Strand',
            required: false
        },
        school: {
            name: {
                type: String,   
            },
            year: {
                type: String,
            }
        },
        attendance: {
            totalYears: {
                type: Number,
            }
        },
        // Additional metadata
        contactNumber: {
            type: String,
        },
    },
    { timestamps: true } // Add createdAt and updatedAt fields
);

// Add virtual for grades
studentSchema.virtual('grades', {
    ref: 'Grade',
    localField: '_id',
    foreignField: 'student',
    justOne: false // This is a one-to-many relationship
});

// Add virtual population for user data
studentSchema.virtual('userData', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true // Since it's a one-to-one relationship
});

// Ensure virtuals are included when converting document to JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });
studentSchema.index({ 'user': 1, 'grades.semester': 1, 'grades.subjects.subject': 1 });
// Compound unique index to prevent duplicates

// Create the Student model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;