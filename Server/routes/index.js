const express = require('express');
const router = express.Router();
const patientRoute = require('./patientroute');
const doctorRoute = require('./doctorroute');
const authRoute = require('./auth');
const appointmentRoutes = require('../routes/appointmentroute');

router.use('/patients', patientRoute);
router.use('/doctors', doctorRoute);
router.use('/auth', authRoute);
router.use('/patientprofile', patientRoute);
router.use('/uploads', express.static('uploads'));
router.use('/appointments', appointmentRoutes);

module.exports = router;
