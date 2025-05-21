import mongoose from "mongoose";

const attendanceSchema = mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    month: {
      type: String,
      required: true
    },
    schoolYear: {
      type: String,
      required: true
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true
        },
        weeks: {
          week1: {
            type: Map,
            of: String,
            default: new Map()
          },
          week2: {
            type: Map,
            of: String,
            default: new Map()
          },
          week3: {
            type: Map,
            of: String,
            default: new Map()
          },
          week4: {
            type: Map,
            of: String,
            default: new Map()
          },
          week5: {
            type: Map,
            of: String,
            default: new Map()
          }
        },
        absent: {
          type: Number,
          default: 0
        },
        tardy: {
          type: Number,
          default: 0
        },
        remarks: {
          type: String,
          default: ''
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Add a pre-save middleware to handle duplicates
attendanceSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      const existingRecord = await this.constructor.findOne({
        section: this.section,
        month: this.month,
        semester: this.semester,
        schoolYear: this.schoolYear,
        teacher: this.teacher
      });

      if (existingRecord) {
        // Update existing record instead
        existingRecord.records = this.records;
        await existingRecord.save();
        return next(new Error('Updated existing record'));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add a static method for upserting attendance records
attendanceSchema.statics.upsertAttendance = async function(filter, update) {
  try {
    return await this.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      // If duplicate key error, try one more time with a simple update
      return await this.findOneAndUpdate(
        filter,
        update,
        {
          new: true,
          runValidators: true
        }
      );
    }
    throw error;
  }
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;