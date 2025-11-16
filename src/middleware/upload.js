const multer = require('multer');
const path = require('path');
const { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } = require('../config/constants');

// Configure multer to use memory storage (files in buffer, not saved to disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Create multer instance with memory storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

module.exports = upload;