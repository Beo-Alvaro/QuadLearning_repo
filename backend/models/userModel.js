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
            enum: ['active', 'pending', 'inactive', 'dropped'],
            default: 'active'
        }
    },    
    status: { type: String, enum: ['active', 'pending', 'inactive'], default: 'active' 
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }
}, { timestamps: true });

// Add methods to handle login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    // Reset attempts if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    
    // Otherwise increment attempts count
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock the account if we've reached max attempts
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Lock for 15 minutes
    }
    
    return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

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