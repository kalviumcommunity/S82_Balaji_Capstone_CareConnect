const express = require('express');
const router = express.Router();

const patient = require('../models/patient');
const doctor = require('../models/doctor');

router.get('/get/patient', async (req, res) => {
    try {
        const get = await patient.find(); 
        res.status(200).json({ message: get }); 
    } catch (err) {
        res.status(400).json({ message: err });
    }
});




router.post('/add/patient',async (req, res) => {
    try {
        const {fullname,email,password} = req.body;
        const newpatient = new patient({
            fullname,
            email,
            password
        }) 
        const saved = await newpatient.save();
        res.status(200).json({ message: saved }); 
    } catch (err) {
        res.status(400).json({ message: err });
    }
})


module.exports = router;