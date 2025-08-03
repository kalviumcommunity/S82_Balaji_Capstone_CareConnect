const express = require('express');
const router = express.Router();
require('dotenv').config();

const patientRoute = require('./patientroute');
const doctorRoute = require('./doctorroute');
const authRoute = require('./auth');
const appointmentRoutes = require('./appointmentroute');

router.use('/patients', patientRoute);
router.use('/doctors', doctorRoute);
router.use('/auth', authRoute);
router.use('/patientprofile', patientRoute);
router.use('/appointments', appointmentRoutes);

module.exports = router;
