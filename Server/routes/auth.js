const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontrol');
const upload = require('../middleware/multer')

router.post('/signup', upload.single('certificate'),authController.signup);
router.post('/login', authController.login);

module.exports = router;
