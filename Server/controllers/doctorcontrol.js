const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');

// Get all doctors (with optional pagination)
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find().skip(skip).limit(limit),
      Doctor.countDocuments()
    ]);
    res.status(200).json({ doctors, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top verified doctors for homepage
exports.getTopDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true })
      .sort({ rating: -1, experience: -1 })
      .limit(6)
      .select('fullName specialization experience photo rating reviewCount bio location');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create doctor
exports.createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    if (req.file) {
      doctorData.certificate = req.file.path;
    }
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit doctor
exports.editDoctor = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.certificate = req.file.path;
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(200).json({ updatedDoctor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get doctors by specialization (with pagination)
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const specialization = req.params.specialization.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find({ specialization }).skip(skip).limit(limit),
      Doctor.countDocuments({ specialization })
    ]);

    if (doctors.length === 0 && page === 1) {
      return res.status(404).json({ message: 'No doctors found for this specialization' });
    }
    res.status(200).json({ doctors, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Delete doctor (self only, unless admin)
exports.deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;
  const isOwner = req.user.role === 'doctor' && req.user.id === doctorId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden: You cannot delete this profile' });
  }

  try {
    await Doctor.findByIdAndDelete(doctorId);
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
};

// Get appointments for a specific doctor (public endpoint used by DoctorAppointments.jsx)
exports.getAppointmentsForDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'fullName email phone');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};
