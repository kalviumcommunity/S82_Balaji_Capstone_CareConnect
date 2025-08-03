const express = require('express');
const router = express.Router();
require('dotenv').config();
const aiRoute = require('./ai');
const patientRoute = require('./patientroute');
const doctorRoute = require('./doctorroute');
const authRoute = require('./auth');
const appointmentRoutes = require('../routes/appointmentroute');

router.use('/patients', patientRoute);
router.use('/doctors', doctorRoute);
router.use('/auth', authRoute);
router.use('/patientprofile', patientRoute); // means prefix is /api/patientprofile
router.use('/appointments', appointmentRoutes);
router.use('/', aiRoute);

module.exports = router;
