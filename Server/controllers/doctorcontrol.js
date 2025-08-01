const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment')
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
    const doctorData = req.body;
    if (req.file) {
      doctorData.certificate = req.file.path; // multer gives file path
    }
    const newDoctor = new Doctor(doctorData);
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
     if (req.file) {
      updates.certificate = req.file.path;
    }
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


// Get doctors by specialization
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const specialization = req.params.specialization.toLowerCase(); // normalize
    const doctors = await Doctor.find({ specialization });
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found for this specialization' });
    }
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;

  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Only doctors can delete their profile' });
  }

  if (req.user.id !== doctorId) {
    return res.status(403).json({ message: 'You can only delete your own profile' });
  }

  try {
    await Doctor.findByIdAndDelete(doctorId);
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
};

// controllers/appointments.js
exports.getAppointmentsForDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "fullName email");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};
