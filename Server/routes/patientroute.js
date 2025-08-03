const express = require('express');
const router = express.Router();
const User = require('../models/patient')
const patientcontroller = require('../controllers/patientcontrol')
const {verifyToken} = require('../middleware/authmiddleware')
const {getprofile} = require('../controllers/authcontrol')

const originalGet = router.get;
router.get = function (...args) {
  console.log(`[DEBUG] router.get in ${__filename} called with:`, args[0]);
  return originalGet.apply(this, args);
};

const originalPost = router.post;
router.post = function (...args) {
  console.log(`[DEBUG] router.post in ${__filename} called with:`, args[0]);
  return originalPost.apply(this, args);
};

const originalPut = router.put;
router.put = function (...args) {
  console.log(`[DEBUG] router.put in ${__filename} called with:`, args[0]);
  return originalPut.apply(this, args);
};

const originalDelete = router.delete;
router.delete = function (...args) {
  console.log(`[DEBUG] router.delete in ${__filename} called with:`, args[0]);
  return originalDelete.apply(this, args);
};


router.get('/get',patientcontroller.getAllPatients);

router.post('/add',patientcontroller.createPatient)

router.put('/edit/:id',patientcontroller.editPatient);

router.post('/:id/assign-doctor', patientcontroller.assignDoctorToPatient);

router.get('/profile', verifyToken, getprofile);
module.exports = router;
