const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'cancelled'],
    default: 'booked',
  },
  meetingLink: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Compound index prevents double-booking (same doctor + date + time)
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);