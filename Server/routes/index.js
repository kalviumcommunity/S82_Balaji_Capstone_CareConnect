const express = require('express');
const router = express.Router();
require('dotenv').config();

// ✅ Debug hook for router.use BEFORE using it
const originalRouterUse = router.use;
router.use = function (...args) {
  console.log('[DEBUG] router.use called with:', args[0]);
  return originalRouterUse.apply(this, args);
};


const originalRouterGet = router.get;
router.get = function (...args) {
  console.log(`[DEBUG] router.get in ${__filename} called with:`, args[0]);
  return originalRouterGet.apply(this, args);
};

// ✅ Import routes
const patientRoute = require('./patientroute');
const doctorRoute = require('./doctorroute');
const authRoute = require('./auth');
const appointmentRoutes = require('./appointmentroute');

console.log('[CHECK] patientRoute:', typeof patientRoute);
console.log('[CHECK] doctorRoute:', typeof doctorRoute);
console.log('[CHECK] authRoute:', typeof authRoute);
console.log('[CHECK] appointmentRoutes:', typeof appointmentRoutes);


// ✅ Register routes
router.use('/patients', patientRoute);
router.use('/doctors', doctorRoute);
router.use('/auth', authRoute);
router.use('/patientprofile', patientRoute);
router.use('/appointments', appointmentRoutes);

module.exports = router;
