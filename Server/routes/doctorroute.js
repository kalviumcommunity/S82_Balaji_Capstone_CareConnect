const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorcontrol');
const { verifyToken } = require('../middleware/authmiddleware');

const originalGet = router.get;
router.get = function (...args) {
  console.log(`[DEBUG] router.get in ${__filename} called with:`, args[0]);
  return originalGet.apply(this, args);
};

const originalPost = router.post;
router.post = function (...args) {
  console.log(`[DEBUG] router.post in ${__filename} called with:`, args[0]);
  return originalPost.apply(this, args);
};

const originalPut = router.put;
router.put = function (...args) {
  console.log(`[DEBUG] router.put in ${__filename} called with:`, args[0]);
  return originalPut.apply(this, args);
};

const originalDelete = router.delete;
router.delete = function (...args) {
  console.log(`[DEBUG] router.delete in ${__filename} called with:`, args[0]);
  return originalDelete.apply(this, args);
};

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
