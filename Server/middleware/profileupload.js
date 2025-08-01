const multer = require("multer");
const path = require("path");

// Storage for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile-images"); // Store in profile-images folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // e.g., 12345.jpg
  },
});

// File filter (Only images)
const profileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG allowed."));
  }
};

const uploadProfileImage = multer({ storage: profileStorage, fileFilter: profileFilter });

module.exports = uploadProfileImage;
