const Patient = require('../models/patient');

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body); // ✅ Fixed 'Patient'
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit a patient
exports.editPatient = async (req, res) => {
  console.log("Edit Patient route hit"); // Log to check if the route is hit
  try {
    const updates = req.body;
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ error: 'Patient Not Found' });
    }
    console.log("ID:", req.params.id);
    console.log("Body:", req.body);
    res.status(200).json({updatedPatient});
  } catch (err) {
    console.log("Error in editPatient:", err); // Log the error explicitly
    res.status(400).json({ error: err });
  }
};
