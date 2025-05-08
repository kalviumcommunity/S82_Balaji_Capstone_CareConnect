const Doctor = require('../models/doctor');

// Get 
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create 
exports.createDoctor = async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
//post
exports.editDoctor = async(req,res)=>{
  try{
    const updates = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updates,
      {new:true}
    )
    if(!updatedDoctor)
    {
      return res.status(400).json({Error:'Doctor Not Found'})
    }
    res.status(200).json({updatedDoctor})
  }
  catch(err)
  {
    res.status(400).send({message:err});
  }
}



