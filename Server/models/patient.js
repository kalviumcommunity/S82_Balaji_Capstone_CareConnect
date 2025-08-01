const mongoose = require('mongoose');
const Address = require('./address'); // Import address schema

const patientSchema = new mongoose.Schema({
<<<<<<< HEAD
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  }],
  address: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Address',  // Reference to address schema
  }
}, { timestamps: true });

=======
  fullName: { type: String, required: false }, // ✅ changed
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ✅ changed
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' }
}, { timestamps: true });


>>>>>>> AI-chatbot
module.exports = mongoose.model('Patient', patientSchema);
