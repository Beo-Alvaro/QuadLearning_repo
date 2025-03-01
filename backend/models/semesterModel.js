import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        enum: ['1st Semester', '2nd Semester', 'Summer Term']
    },
    strand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strand',
        required: true
    },
    yearLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YearLevel',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    subjects: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subject',
      required: false 
    }], 
    endDate: {
        type: Date,
        required: true
    },
    status: { type: String, enum: ['active', 'pending'], default: 'active' }
}, { 
    timestamps: true 
});

const Semester = mongoose.model('Semester', semesterSchema);
export default Semester;