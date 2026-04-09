const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointementcontroller");
const { verifyToken } = require("../middleware/authmiddleware");

// Create booking (public — patient submits their own ID)
router.post("/", appointmentController.createAppointment);

// Get appointments by patient ID
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);

// Get appointments for the logged-in doctor (JWT-based, no hardcoded ID)
router.get("/doctor", verifyToken, appointmentController.getAppointmentsByDoctor);

// Cancel an appointment
router.patch("/cancel/:id", appointmentController.cancelAppointment);

// Update status (Doctor Only)
router.patch("/status/:id", verifyToken, appointmentController.updateAppointmentStatus);

module.exports = router;
