const Patient = require('../models/patient');

// Get 
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create 
exports.createPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body); // ✅ Fixed 'Patient'
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit 
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

// Assign doctor
exports.assignDoctorToPatient = async (req, res) => {
  const { doctorId } = req.body;
  const { id: patientId } = req.params;

  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    if(!doctorId)
    {
      return res.status(400).send('Doctor Was not found');
    }
    if (!patient.doctors.includes(doctorId)) {
      patient.doctors.push(doctorId);
      await patient.save();
    }

    res.status(200).json({ message: 'Doctor assigned successfully', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
