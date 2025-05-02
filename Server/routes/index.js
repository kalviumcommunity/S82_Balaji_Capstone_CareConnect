const express = require('express')
const router = express.Router();

const patientroute = require('./patientroute')
const doctorroute = require('./doctorroute')
const authroute = require('./auth')

router.use('/patients',patientroute)
router.use('/doctors',doctorroute)
router.use('/auth',authroute)

module.exports = router;