const mongoose = require('mongoose');
const Address = require('./address');

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
    required: false,
  },
  // Admin verification — default to false so admin must approve
  isVerified: {
    type: Boolean,
    default: false,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  // Additional profile fields
  bio: {
    type: String,
    default: null,
  },
  consultationFee: {
    type: Number,
    default: null,
  },
  photo: {
    type: String, // URL to profile photo
    default: null,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
