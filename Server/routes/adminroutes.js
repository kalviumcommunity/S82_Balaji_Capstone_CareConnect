const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');

// NOTE: verifyToken + authorizeRoles('admin') is already applied in app.js
// when this router is mounted. No need to duplicate here.

// 🔐 GET all doctors with pagination (Admin only)
router.get('/doctors', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status === 'pending') filter.isVerified = false;
    if (req.query.status === 'verified') filter.isVerified = true;

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('-password -__v')
        .sort({ isVerified: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔐 VERIFY doctor (Admin only)
router.patch('/verify/:doctorId', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      { isVerified: true, rejectionReason: null },
      { new: true }
    ).select('-password -__v');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor verified successfully', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔐 REJECT doctor (Admin only)
router.patch('/reject/:doctorId', async (req, res) => {
  try {
    const { reason } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      {
        isVerified: false,
        rejectionReason: reason || 'Certificate not valid',
      },
      { new: true }
    ).select('-password -__v');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor rejected', data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;