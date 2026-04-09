const express = require('express');
const router = express.Router();
const User = require('../models/patient');
const patientcontroller = require('../controllers/patientcontrol');
const { verifyToken ,authorizeRoles } = require('../middleware/authmiddleware');
const { getprofile } = require('../controllers/authcontrol');

router.get(
  '/get',
  verifyToken,
  authorizeRoles("admin"),
  patientcontroller.getAllPatients
);
router.post('/add', patientcontroller.createPatient);
router.put('/edit/:id', patientcontroller.editPatient);
router.post('/:id/assign-doctor', patientcontroller.assignDoctorToPatient);
router.get('/profile', verifyToken, getprofile);

module.exports = router;
