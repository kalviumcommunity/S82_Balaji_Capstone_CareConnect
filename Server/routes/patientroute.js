const express = require('express');
const router = express.Router();

const patientcontroller = require('../controllers/patientcontrol')

router.get('/',patientcontroller.getAllPatients);

router.post('/',patientcontroller.createPatient)


module.exports = router;
