import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'superadmin'],
        required: true,
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    }],
    strand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    }],

    yearLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YearLevel',
        required: function() { return this.role === 'student'; }
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: function() { return this.role === 'student'; }
    },
       // For teachers: multiple semesters
       semesters: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester'
        }],
        select: function() {
            return this.role === 'teacher';
        }
    },
    advisorySection: {
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        },
        status: {
            type: String,
            enum: ['active', 'pending', 'inactive'],
            default: 'active'
        }
    },    
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' },
}, { timestamps: true });

// Add this virtual field to link with Student model
userSchema.virtual('studentInfo', {
    ref: 'Student',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Enable virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


const User = mongoose.model('User', userSchema);

export default User;