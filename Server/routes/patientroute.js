const express = require('express');
const router = express.Router();

const patientcontroller = require('../controllers/patientcontrol')

router.get('/get',patientcontroller.getAllPatients);

router.post('/add',patientcontroller.createPatient)

router.put('/edit/:id',patientcontroller.editPatient);


module.exports = router;
