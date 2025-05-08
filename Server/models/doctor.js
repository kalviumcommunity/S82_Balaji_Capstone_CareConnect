const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  certificateUrl: { 
    type: String,
    required:true,
  },
  isVerified: {
    type: Boolean,
    default: false, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
