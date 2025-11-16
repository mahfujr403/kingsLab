const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { idValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/upload');
const {
  getAllTimeline,
  getTimelineEvent,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
} = require('../controllers/timelineController');

// @route   GET /api/timeline
router.get('/timeline', getAllTimeline);

// @route   GET /api/timeline/:id
router.get('/timeline/:id', idValidation, validate, getTimelineEvent);

// @route   POST /api/admin/timeline
router.post('/admin/timeline', protect, upload.single('image'), createTimelineEvent);

// @route   PUT /api/admin/timeline/:id
router.put('/admin/timeline/:id', protect, idValidation, validate, upload.single('image'), updateTimelineEvent);

// @route   DELETE /api/admin/timeline/:id
router.delete('/admin/timeline/:id', protect, idValidation, validate, deleteTimelineEvent);

module.exports = router;