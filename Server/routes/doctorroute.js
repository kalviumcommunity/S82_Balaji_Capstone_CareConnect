const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorcontrol');
const { verifyToken, authorizeRoles } = require('../middleware/authmiddleware');

router.get('/:doctorId/appointments', doctorController.getAppointmentsForDoctor);
router.get('/availability/:id', doctorController.getDoctorAvailability);
router.put('/availability/:id', verifyToken, doctorController.updateDoctorAvailability);

router.get('/top', doctorController.getTopDoctors);

router.get('/get', doctorController.getAllDoctors);

router.get('/specialty/:specialization', doctorController.getDoctorsBySpecialization);

// FIX: previously public with no auth at all — anyone could create a doctor
// with isVerified: true and a plaintext password. Admin-only now, matching
// the security model your admin verification flow already assumes.
router.post('/add', verifyToken, authorizeRoles('admin'), doctorController.createDoctor);

// FIX: previously public with no auth at all — anyone could edit any doctor,
// including self-verifying via isVerified: true. Now requires login; the
// controller itself enforces self-or-admin ownership.
router.put('/edit/:id', verifyToken, doctorController.editDoctor);

router.delete('/:id', verifyToken, doctorController.deleteDoctor);

module.exports = router;