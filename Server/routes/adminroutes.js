const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');

// GET /api/cc-admin-9x7z/doctors — All doctors (unverified first)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ isVerified: 1, createdAt: -1 });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cc-admin-9x7z/verify/:doctorId — Approve a doctor
router.patch('/verify/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      { isVerified: true, rejectionReason: null },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    console.info(`[ADMIN ACTION] Doctor ${req.params.doctorId} (${doctor.fullName}) VERIFIED by Admin at ${new Date().toISOString()}`);
    
    res.status(200).json({ message: 'Doctor verified successfully', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/cc-admin-9x7z/reject/:doctorId — Reject a doctor
router.patch('/reject/:doctorId', async (req, res) => {
  try {
    const { reason } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      { isVerified: false, rejectionReason: reason || 'Certificate not valid' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    console.warn(`[ADMIN ACTION] Doctor ${req.params.doctorId} (${doctor.fullName}) REJECTED by Admin at ${new Date().toISOString()}. Reason: ${reason || 'Certificate not valid'}`);
    
    res.status(200).json({ message: 'Doctor rejected', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
