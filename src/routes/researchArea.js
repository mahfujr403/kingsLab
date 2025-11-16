const express = require('express');
const router = express.Router();
const {
  getAllResearchAreas,
  getResearchArea,
  createResearchArea,
  updateResearchArea,
  deleteResearchArea,
  reorderResearchAreas
} = require('../controllers/researchAreaController');
const { protect } = require('../middleware/auth');
const { researchAreaValidation, idValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

// Public routes
router.get('/research-areas', getAllResearchAreas);
router.get('/research-areas/:id', idValidation, validate, getResearchArea);

// Admin routes
router.post('/admin/research-areas', protect, upload.single('image'), createResearchArea);
router.put('/admin/research-areas/:id', protect, idValidation, validate, upload.single('image'), updateResearchArea);
router.delete('/admin/research-areas/:id', protect, idValidation, validate, deleteResearchArea);
router.patch('/admin/research-areas/reorder', protect, reorderResearchAreas);

module.exports = router;