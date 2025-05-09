import asyncHandler from 'express-async-handler';
import Semester from '../models/semesterModel.js';
import Section from '../models/sectionModel.js'
import User from '../models/userModel.js';
import mongoose from 'mongoose';

// @desc    Get all semesters
// @route   GET /api/semesters
// @access  Private
// semesterController.js or in your existing route file
// In your semesterController or routes file
// controllers/semesterController.js
const getSemesters = asyncHandler(async (req, res) => {
    try {
        const semesters = await Semester.find({})
            .populate({
                path: 'strand',
                select: 'name'
            })
            .populate({
                path: 'yearLevel',
                select: 'name'
            })
            .lean();

        const formattedSemesters = semesters.map(semester => {
            // Safely handle potential null or undefined values
            return {
                _id: semester._id,
                name: semester.name || 'Unnamed Semester',
                startDate: semester.startDate,
                endDate: semester.endDate,
                status: semester.status,
                strand: semester.strand 
                    ? { 
                        _id: semester.strand._id, 
                        name: semester.strand.name || 'Unnamed Strand'
                    } 
                    : null,
                yearLevel: semester.yearLevel 
                    ? {
                        _id: semester.yearLevel._id,
                        name: semester.yearLevel.name || 'Unnamed Year Level'
                    } 
                    : null
            };
        });

        // Log the formatted semesters to see their structure
        console.log('Formatted Semesters:', formattedSemesters);

        res.status(200).json(formattedSemesters);
    } catch (error) {
        console.error('Semester Fetch Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching semesters',
            error: error.message
        });
    }
});

const endSemester = async (req, res) => {
    console.log('endSemester function hit');
    try {
        const semester = await Semester.findById(req.params.id);

        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }

        if (new Date() <= semester.endDate) {
            return res.status(400).json({ message: 'Semester not yet ended' });
        }

        // Update students' status to pending
        const updatedStudents = await User.updateMany(
            { yearLevel: semester.yearLevel, semester: semester._id, status: 'active' }, 
            { status: 'pending' }
        );
    
       // Update sections' status to inactive (if sections belong to this year level)
       const updatedSections = await Section.updateMany(
        { yearLevel: semester.yearLevel, status: 'active' }, // <- Fixed this
        { status: 'inactive' }
    );

    // Update advisory sections' status to inactive
    const updatedAdvisorySections = await User.updateMany(
        { advisoryClass: { $exists: true }, yearLevel: semester.yearLevel, status: 'active' },
        { status: 'inactive' }
    );

        // Update semester status to pending
        semester.status = 'inactive';
        await semester.save();

        console.log(updatedStudents, updatedSections, updatedAdvisorySections);
        res.status(200).json({ message: 'Semester ended, students set to pending, and semester marked as inactive' });
    } catch (error) {
        console.error('Error in endSemester:', error);
        res.status(500).json({ message: 'Failed to end semester', error: error.message });
    }
};



export { getSemesters, endSemester };