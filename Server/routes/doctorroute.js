const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorcontrol');
const { verifyToken } = require('../middleware/authmiddleware');

router.get('/:doctorId/appointments', doctorController.getAppointmentsForDoctor);

router.get('/top', doctorController.getTopDoctors);

router.get('/get', doctorController.getAllDoctors);

router.get('/specialty/:specialization', doctorController.getDoctorsBySpecialization);

router.post('/add', doctorController.createDoctor);

router.put('/edit/:id', doctorController.editDoctor);

router.delete('/:id', verifyToken, doctorController.deleteDoctor);

module.exports = router;
