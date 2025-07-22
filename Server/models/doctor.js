const mongoose = require('mongoose');
const Address = require('./address'); // Import address schema

const doctorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: false,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
  },
  password: {
    type: String,
    required: false,
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
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: true, 
  },
  addresses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Address'  // Reference to address schema
  }],
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
