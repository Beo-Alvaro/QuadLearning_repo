import mongoose from 'mongoose';

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
            // required: true removed
        },
        lastName: {
            type: String,
            // required: true removed
        },
        middleInitial: {

            type: String,
            maxlength: 1,
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
            // required: true removed
        },
        birthplace: {
            province: String,   
            municipality: String,
            barrio: String,
        },
        address: {
            type: String,
            // required: true removed
        },
        guardian: {
            name: {
                type: String,
                // required: true removed
            },
            occupation: String,
        },
        yearLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'YearLevel'
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
        },
        strand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Strand',
        },
        school: {
            name: {
                type: String,
                // required: true removed
            },
            year: {
                type: String,
                // required: true removed
            }
        },
        attendance: {
            totalYears: {
                type: Number,
                // required: true removed
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

export default Student;