const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const upload = require('../middleware/multer');

const SECRET = process.env.SECRET_KEY;

// Login function
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

// Signup function
// Signup function
exports.signup = async (req, res) => {
  const { fullName, email, password, role, specialization, experience, location, certificateUrl } = req.body;
  const certificateFile = req.file; // File from multer

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === 'doctor') {
      // Ensure all doctor-specific fields are provided
      if (!fullName || !specialization || !experience || !location) {
        return res.status(400).json({ message: 'Doctor details are missing required fields' });
      }

      let certificateUrlToSave;

      // If file is uploaded, use the file path
      if (certificateFile) {
        certificateUrlToSave = `/uploads/${certificateFile.filename}`;
      } else if (certificateUrl) {
        // If URL is provided, use that as the certificate link
        certificateUrlToSave = certificateUrl;
      } else {
        // If neither file nor URL is provided, return error
        return res.status(400).json({ message: 'Certificate is required (either file or URL)' });
      }

      // Create a new doctor record
      newUser = new Doctor({
        fullName,
        email,
        password: hashedPassword,
        specialization,
        experience,
        location,
        certificateurl: certificateUrlToSave, // store the certificate URL
      });
    } else {
      // Create a new patient record
      newUser = new Patient({ fullname: fullName, email, password: hashedPassword });
    }

    // Save the new user to the database
    await newUser.save();

    // Generate JWT token for the user
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
