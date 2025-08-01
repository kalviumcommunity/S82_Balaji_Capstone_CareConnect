const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointementcontroller");

// Create booking
router.post("/", appointmentController.createAppointment);

// Get appointments by patient
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);

// Cancel
router.patch("/cancel/:id", appointmentController.cancelAppointment);

module.exports = router;
