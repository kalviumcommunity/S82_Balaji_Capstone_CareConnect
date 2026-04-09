const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // e.g., "10:30 AM"
    required: true
  },
  status: {
    type: String,
    enum: ["booked", "completed", "cancelled"],
    default: "booked"
  },
  meetingLink: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
