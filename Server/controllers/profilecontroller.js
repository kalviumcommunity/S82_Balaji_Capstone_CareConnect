const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// ✅ Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const userId = req.user.id;
    const imagePath = `uploads/profile-images/${req.file.filename}`;

    // Find Doctor first, then Patient
    let user = await Doctor.findById(userId);
    if (!user) user = await Patient.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.image = imagePath;
    await user.save();

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      data: { imageUrl: `${BACKEND_URL}/${imagePath}` },
    });
  } catch (err) {
    console.error("[PROFILE] uploadProfilePhoto error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await Doctor.findById(userId).select("-password -__v");
    if (user) {
      return res.json({
        success: true,
        data: {
          ...user.toObject(),
          role: "doctor",
          image: user.image ? `${BACKEND_URL}/${user.image}` : null,
        },
      });
    }

    user = await Patient.findById(userId).select("-password -__v");
    if (user) {
      return res.json({
        success: true,
        data: {
          ...user.toObject(),
          role: "patient",
          image: user.image ? `${BACKEND_URL}/${user.image}` : null,
        },
      });
    }

    return res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    console.error("[PROFILE] getProfile error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Toggle MFA
const toggleMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    let user = await Doctor.findById(userId);
    if (!user) user = await Patient.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.mfaEnabled = enabled !== undefined ? enabled : !user.mfaEnabled;
    await user.save();

    console.log(`[AUTH] MFA ${user.mfaEnabled ? 'ENABLED' : 'DISABLED'} for ${user.email}`);
    res.json({
      success: true,
      message: `MFA ${user.mfaEnabled ? 'enabled' : 'disabled'} successfully`,
      data: { mfaEnabled: user.mfaEnabled },
    });
  } catch (err) {
    console.error("[PROFILE] toggleMfa error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { uploadProfilePhoto, getProfile, toggleMfa };
