// routes/imageRoutes.js
// В начале файла imageController.js



const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/imageController');
const path = require('path');
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir) // Используйте абсолютный путь
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split('.').pop();
      cb(null, Date.now() + '.' + extension)
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadImage);

module.exports = router;
