const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
  // Use Cloudinary for persistent storage (Best for Render/Vercel)
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'oursfit_products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  // Fallback to local storage (Ephemeral on Render)
  storage = multer.diskStorage({
    destination(req, file, cb) {
      const dir = 'uploads/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      cb(null, dir);
    },
    filename(req, file, cb) {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });
}

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (!isCloudinaryConfigured) {
       checkFileType(file, cb);
    } else {
       cb(null, true); // Cloudinary params handles allowed_formats
    }
  },
});

router.post('/', upload.single('image'), (req, res) => {
  if (isCloudinaryConfigured) {
    // Cloudinary returns the full secure_url
    res.send(req.file.path);
  } else {
    // Local fallback
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
    res.send(imagePath);
  }
});

module.exports = router;
