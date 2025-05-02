const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const doctorcontroller = require('../controllers/doctorcontrol')

router.get('/get',doctorcontroller.getAllDoctors);

router.post('/add',doctorcontroller.createDoctor);

router.put('/edit/:id',doctorcontroller.editDoctor);

module.exports = router;
