import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true 
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    strand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Strand',
        required: true
    },
    semester: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Semester',
        required: true
    },
    yearLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YearLevel',
        required: true
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false
    }]

    

});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;