const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authmiddleware');
const { createRating, getDoctorRatings } = require('../controllers/ratingcontroller');

const router = express.Router();

router.get('/doctor/:doctorId', verifyToken, getDoctorRatings);
router.post('/', verifyToken, authorizeRoles('patient'), createRating);

module.exports = router;