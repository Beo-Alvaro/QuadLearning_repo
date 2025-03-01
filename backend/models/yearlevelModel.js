import mongoose from 'mongoose';

const yearLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Grade 11', 'Grade 12'], // Restrict values to 'Grade 11' or 'Grade 12'
      unique: true, // Ensure no duplicates for the same value
    },
    description: {
      type: String,
      required: false, // Optional field for additional info about the year level
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

const YearLevel = mongoose.model('YearLevel', yearLevelSchema);

export default YearLevel;