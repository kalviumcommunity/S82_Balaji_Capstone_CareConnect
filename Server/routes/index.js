const express = require('express')
const router = express.Router();

const patientRoute = require('./patientroute')
const doctorRoute = require('./doctorroute')
const authRoute = require('./auth')

router.use('/patients',patientRoute)
router.use('/doctors',doctorRoute)
router.use('/auth',authRoute)

router.use('/uploads', express.static('uploads')); // To make uploads publicly accessible


module.exports = router;