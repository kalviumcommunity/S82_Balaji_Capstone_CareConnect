const express = require('express')
const router = express.Router();
require('dotenv').config();
const patientRoute = require('./patientroute')
const doctorRoute = require('./doctorroute')
const authRoute = require('./auth')

router.use('/patients',patientRoute)
router.use('/doctors',doctorRoute)
router.use('/auth',authRoute)
router.use('/patientprofile', patientRoute); // means prefix is /api/patientprofile
router.use('/uploads', express.static('uploads')); // To make uploads publicly accessible


module.exports = router;