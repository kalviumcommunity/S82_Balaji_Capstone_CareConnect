const patient = require('../models/patient');

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await patient.find();
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const newPatient = new patient(req.body);
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.editPatient = async(req,res)=>{
  try{
    const updates = req.body;
    const updatedPatient = await patient.findByIdAndUpdate(
      req.params.id,
      updates,
      {new:true}
    )
    if(!updatedPatient)
    {
      return res.status(400).json({Error:'Patient Not Found'})
    }
    res.status(200).json({updatedPatient})
  }
  catch(err)
  {
    res.status(400).send({message:err});
  }
}