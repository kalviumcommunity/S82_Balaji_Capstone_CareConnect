const bcrypt = require('bcrypt');
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

// ─────────────────────────────────────────────────────────────────────────────
// Create doctor (ADMIN ONLY)
// FIX: previously accepted the entire req.body unfiltered — anyone, with no
// login, could set isVerified: true directly and bypass admin approval, and
// passwords were saved in plaintext (never hashed, unlike /api/auth/signup).
// Route-level protection (verifyToken + authorizeRoles('admin')) is added in
// doctorroute.js; this function also defensively whitelists fields and hashes
// any password server-side regardless of what's sent.
// ─────────────────────────────────────────────────────────────────────────────
exports.createDoctor = async (req, res) => {
  try {
    const {
      fullName, email, password, specialization,
      experience, location, bio, consultationFee,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctorData = {
      fullName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      specialization: specialization?.toLowerCase(),
      experience,
      location,
      bio,
      consultationFee,
      isVerified: false, // always false on creation, regardless of what was sent
    };

    if (req.file) {
      doctorData.certificateUrl = req.file.path;
    }

    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();

    const { password: _, ...safeDoctor } = newDoctor.toObject();
    res.status(201).json(safeDoctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Edit doctor (self or admin only)
// FIX: previously had no auth check at all and accepted the full req.body,
// so anyone could PUT { isVerified: true } to self-verify with zero login.
// Now matches the same ownership pattern already used correctly in
// deleteDoctor below, plus whitelists which fields a non-admin can change.
// ─────────────────────────────────────────────────────────────────────────────
exports.editDoctor = async (req, res) => {
  const doctorId = req.params.id;
  const isOwner = req.user.role === 'doctor' && req.user.id === doctorId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden: You cannot edit this profile' });
  }

  try {
    let updates;

    if (isAdmin) {
      // Admin may update anything, including verification status.
      updates = { ...req.body };
    } else {
      // Doctors editing their own profile cannot touch sensitive fields.
      const { fullName, specialization, experience, location, bio, consultationFee, availability } = req.body;
      updates = { fullName, specialization, experience, location, bio, consultationFee, availability };
    }

    if (req.file) {
      updates.certificateUrl = req.file.path;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updates,
      { new: true }
    ).select('-password');

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

exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('availability fullName');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor.availability || [],
      doctorName: doctor.fullName,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctor availability' });
  }
};

exports.updateDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array.' });
    }

    const cleanedAvailability = availability.map((entry) => ({
      day: entry.day,
      slots: Array.isArray(entry.slots) ? entry.slots.filter(Boolean) : [],
    })).filter((entry) => entry.day && Array.isArray(entry.slots) && entry.slots.length > 0);

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { availability: cleanedAvailability },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor availability updated successfully',
      data: doctor.availability,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update doctor availability' });
  }
};