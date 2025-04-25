import mongoose from 'mongoose';

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
            type: Object,
            default: {}
          },
          week2: {
            type: Object,
            default: {}
          },
          week3: {
            type: Object,
            default: {}
          },
          week4: {
            type: Object,
            default: {}
          },
          week5: {
            type: Object,
            default: {}
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

// Create a compound index for faster queries
attendanceSchema.index(
  { section: 1, month: 1, semester: 1 }, 
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 