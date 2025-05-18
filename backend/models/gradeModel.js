import mongoose from 'mongoose';

const gradeSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        school: {
            name: String,
            id: String, // School ID
        },
        schoolYear: {
            type: String, // Example: "2024-2025"
            required: false,
        },
        yearLevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "YearLevel",
            required: false,
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: false,
        },
        strand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Strand",
            required: false,
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: false,
        },
        subjects: [
            {
                subject: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Subject",
                    required: false,
                },
                midterm: {
                    type: Number,
                    min: 0,
                    max: 100,
                },
                finals: {
                    type: Number,
                    min: 0,
                    max: 100,
                },
                finalRating: {
                    type: Number,
                    min: 0,
                    max: 100,
                },
                action: {
                    type: String,
                    enum: ["PASSED", "FAILED"],
                },
            },
        ],
    },
    { timestamps: true }
);

// Add this index for better query performance
gradeSchema.index({ student: 1, yearLevel: 1, 'semester.status': 1 });

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;