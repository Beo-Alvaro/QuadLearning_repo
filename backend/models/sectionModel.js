import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    }, // Name of the section (e.g., Grade 11 STEM A)
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    }], // Students in this section
    teacher: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false 
    }], // Assigned teacher
    strand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Strand',
        required: true 
    }, // Reference to the strand
    yearLevel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'YearLevel',
        required: true 
    }, // Reference to the year level
    advisoryClass: {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        }
    },    
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive'],
    }
}, { 
    timestamps: true 
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;