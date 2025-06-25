const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const User = require('../models/patient.js');
const upload = require('../middleware/multer.js');
//const sendMail = require('../util/mail.js');
require('dotenv').config();
const SECRET = process.env.SECRET_KEY;
const otpStore = new Map();



// In your auth or user controller

exports.getprofile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // assume you store this in JWT or session
    const address = req.user.address;
    if (role === 'doctor') {
      const doctor = await Doctor.findById(userId).populate('addresses');
      return res.json({ user:{doctor,role} });
    } else {
      const patient = await Patient.findById(userId)
        .populate('address')
        .populate({ path: 'doctors', populate: { path: 'address' } });
      return res.json({ user: {patient,role,address} });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// 🔐 Doctor & Patient Login
// ─────────────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ email });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role},SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📝 Doctor & Patient Signup
// ─────────────────────────────────────────────────────────────────────────────

exports.signup = async (req, res) => {
  const { fullName, email, password, role, specialization} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (role === 'doctor') {
      const certificateUrl = req.file ? req.file.path : null;
user = new Doctor({
  fullName: fullName,
  email,
  password: hashedPassword,
  specialization:specialization.toLowerCase(),
  experience: req.body.experience, 
  location: req.body.location,     
  certificateUrl,                  
  addresses: [],                   
});

    } else if (role === 'patient') {
      user = new Patient({ fullName, email, password: hashedPassword});
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: 'Internal server error' },err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📤 Send OTP for User Signup
// ─────────────────────────────────────────────────────────────────────────────

async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.ADMIN_NAME,
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `Care-connect <${process.env.ADMIN_NAME}>`,
    to: email,
    subject: 'Your OTP for Signup in ClickIn',
    text: `Your OTP is: ${otp}. It is valid for 3 minutes.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 👤 User Signup (with OTP)
// ─────────────────────────────────────────────────────────────────────────────

exports.createUser = async (req, res) => {
  const { name, email, password, phone, addresses } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 5);
    const newUser = new User({ name, email, password: hashedPassword, phone, addresses });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, {
      otp,
      name,
      expiresAt: Date.now() + 3 * 60 * 1000,
    });

    await sendOTP(email, otp);
    await newUser.save();

    res.status(201).json({ message: 'OTP sent to your mail' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Verify OTP
// ─────────────────────────────────────────────────────────────────────────────

exports.otpverify = async (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore.get(email);
  if (!stored || Date.now() > stored.expiresAt) {
    return res.status(410).json({ message: 'OTP expired or not requested' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Signup not initiated' });

  await User.findByIdAndUpdate(user._id, { isActivated: true });
  otpStore.delete(email);

  res.status(200).json({ message: 'Signup successful' });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔐 User Login (after OTP verified)
// ─────────────────────────────────────────────────────────────────────────────

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.isActivated) return res.status(403).json({ message: 'Please verify your account via OTP' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('accesstoken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ user, token });
};

// ─────────────────────────────────────────────────────────────────────────────
// 🌐 Google Auth Callback
// ─────────────────────────────────────────────────────────────────────────────

exports.googleAuthCallback = async (req, res) => {
  try {
    const { profile, user } = req.user;
    const { displayName, emails } = profile;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'Email is required for authentication' });
    }

    const email = emails[0].value;
    const name = displayName;

    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      existingUser = new User({ name, email, password: null, isActivated: true });
      await existingUser.save();
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('accesstoken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.redirect(`http://localhost:5173/google-success?token=${token}`);
  } catch (err) {
    res.status(500).json({ message: "Google Auth failed", error: err.message });
  }
};
