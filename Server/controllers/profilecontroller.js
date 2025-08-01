const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

// ✅ Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const userId = req.user.id;
    const imagePath = `uploads/profile-images/${req.file.filename}`;

    // Find Doctor first
    let user = await Doctor.findById(userId);
    if (!user) {
      // If not doctor, check Patient
      user = await Patient.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.image = imagePath;
    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      imageUrl: `http://localhost:3000/${imagePath}`,
    });
  } catch (err) {
    console.error("Error in uploadProfilePhoto:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await Doctor.findById(userId).select("name email image");
    if (user) {
      return res.json({
        name: user.name,
        email: user.email,
        role: "doctor",
        image: user.image ? `http://localhost:3000/${user.image}` : null
      });
    }

    user = await Patient.findById(userId).select("name email image");
    if (user) {
      return res.json({
        name: user.name,
        email: user.email,
        role: "patient",
        image: user.image ? `http://localhost:3000/${user.image}` : null
      });
    }

    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { uploadProfilePhoto, getProfile };
