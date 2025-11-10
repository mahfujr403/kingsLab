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

// Public routes
router.get('/publications', getAllPublications);
router.get('/publications/:id', idValidation, validate, getPublication);

// Admin routes
router.post('/admin/publications', protect, publicationValidation, validate, createPublication);
router.put('/admin/publications/:id', protect, idValidation, publicationValidation, validate, updatePublication);
router.delete('/admin/publications/:id', protect, idValidation, validate, deletePublication);

module.exports = router;