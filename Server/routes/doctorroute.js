const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorcontrol');
const { verifyToken } = require('../middleware/authmiddleware');

// Added route from AI-chatbot branch
router.get("/:doctorId/appointments", doctorController.getAppointmentsForDoctor);

// All Doctors
router.get('/get', doctorController.getAllDoctors);

// Add New
router.post('/add', doctorController.createDoctor);

// Edit
router.put('/edit/:id', doctorController.editDoctor);

// Delete — restricted to doctor (own profile) or admin
router.delete('/:id', verifyToken, doctorController.deleteDoctor);

// Specialty based fetch
router.get('/specialty/:specialization', doctorController.getDoctorsBySpecialization);

module.exports = router;
