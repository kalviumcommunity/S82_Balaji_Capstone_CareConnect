const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Import bcrypt
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
//const bcrypt = require('bcryptjs'); // If using bcryptjs

const SECRET = process.env.SECRET_KEY;

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;

    if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use bcrypt.compare to check the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.signup = async (req, res) => {
    const { fullName, email, password, role, specialization, experience, location, certificateUrl } = req.body;
  
    try {
      // Check if user already exists
      let existingUser;
      if (role === 'doctor') {
        existingUser = await Doctor.findOne({ email });
      } else if (role === 'patient') {
        existingUser = await Patient.findOne({ email });
      } else {
        return res.status(400).json({ message: 'Invalid role' });
      }
  
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      let newUser;
      if (role === 'doctor') {
        // Check if all doctor-specific fields are provided
        if (!fullName || !specialization || !experience || !location || !certificateUrl) {
          return res.status(400).json({ message: 'Doctor details are missing required fields' });
        }
  
        newUser = new Doctor({
          fullName,
          email,
          password: hashedPassword,
          specialization,
          experience,
          location,
          certificateUrl,
        });
      } else {
        newUser = new Patient({ name: fullName, email, password: hashedPassword });
      }
  
      await newUser.save();
  
      const token = jwt.sign(
        { id: newUser._id, role },
        SECRET,
        { expiresIn: '1d' }
      );
  
      res.status(201).json({ message: 'Signup successful', token, role });
    } catch (err) {
      res.status(500).json({ message: 'Signup failed', error: err.message });
    }
  };
  