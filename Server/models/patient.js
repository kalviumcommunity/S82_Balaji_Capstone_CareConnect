const mongoose = require('mongoose');
const Address = require('./address');

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  // OTP verification flag — was missing from original schema
  isActivated: { type: Boolean, default: false },
  // Extended profile fields
  phone: { type: String, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', null], default: null },
  bloodGroup: { type: String, default: null },
  dateOfBirth: { type: Date, default: null },
  profilePhoto: { type: String, default: null }, // URL
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  mfaEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
