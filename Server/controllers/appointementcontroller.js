const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');

// POST: Create Appointment
exports.createAppointment = async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;

  try {
    // Prevent double-booking (same doctor, date, time)
    const existing = await Appointment.findOne({ doctor: doctorId, date, time });
    if (existing) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }

    const newAppointment = new Appointment({ doctor: doctorId, patient: patientId, date, time });
    await newAppointment.save();

    res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Appointments by Patient
exports.getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const appointments = await Appointment.find({ patient: patientId }).populate("doctor", "fullName specialization");
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Optional: Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
