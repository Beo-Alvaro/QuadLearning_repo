const mongoose = require('mongoose');


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
        required: false 
    }, // Reference to the strand

    yearLevel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'YearLevel',
        required: false
    }, // Reference to the year level

    advisoryClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Link to a teacher who is assigned as the advisor
        required: false, // Advisory class is optional, can be updated later
        default: null, // Default is null
      },
}, { 
    timestamps: true 
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
