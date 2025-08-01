const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  profileImage: {
    type: String,
    default: "uploads/profile-images/default-avatar.png"
  },
  bio: { type: String, default: "" },
  phone: { type: String },
  socialLinks: { type: Map, of: String }, // optional for links like LinkedIn, Instagram
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
