const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointementcontroller");
const { verifyToken, authorizeRoles } = require("../middleware/authmiddleware");

// All appointment routes require authentication
router.use(verifyToken);

// Create booking (patient only — patientId comes from JWT, not body)
router.post("/", authorizeRoles('patient'), appointmentController.createAppointment);

// Get appointments for the logged-in patient (JWT-based, IDOR-safe)
router.get("/patient", authorizeRoles('patient'), appointmentController.getAppointmentsByPatient);

// Get appointments for the logged-in doctor (JWT-based)
router.get("/doctor", authorizeRoles('doctor'), appointmentController.getAppointmentsByDoctor);

// Cancel an appointment (owner only — checked in controller)
router.patch("/cancel/:id", appointmentController.cancelAppointment);

// Update status (Doctor Only — ownership checked in controller)
router.patch("/status/:id", authorizeRoles('doctor'), appointmentController.updateAppointmentStatus);

module.exports = router;
