const express = require('express');
const router = express.Router();
const {
  getAllPublications,
  getPublication,
  createPublication,
  updatePublication,
  deletePublication
} = require('../controllers/publicationController');
const { protect } = require('../middleware/auth');
const { publicationValidation, idValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

// Public routes
router.get('/publications', getAllPublications);
router.get('/publications/:id', idValidation, validate, getPublication);

// Admin routes - with file upload support for certificate and event_photo_file
router.post('/admin/publications', protect, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'event_photo_file', maxCount: 1 }
]), publicationValidation, validate, createPublication);

router.put('/admin/publications/:id', protect, idValidation, validate, upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'event_photo_file', maxCount: 1 }
]), publicationValidation, validate, updatePublication);

router.delete('/admin/publications/:id', protect, idValidation, validate, deletePublication);

module.exports = router;