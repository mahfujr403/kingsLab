const express = require('express');
const router = express.Router();
const Timeline = require('../models/Timeline');
const { protect } = require('../middleware/auth');
const { timelineValidation, idValidation, validate } = require('../middleware/validator');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const upload = require('../middleware/upload');

// @route   GET /api/timeline
router.get('/timeline', async (req, res, next) => {
  try {
    const { year, sort = 'date', order = 'desc' } = req.query;
    
    const query = {};
    if (year) {
      query.year = parseInt(year, 10);
    }
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };
    
    const timeline = await Timeline.find(query).sort(sortOptions);
    
    return successResponse(res, timeline);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/timeline/:id
router.get('/timeline/:id', idValidation, validate, async (req, res, next) => {
  try {
    const event = await Timeline.findById(req.params.id);
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    return successResponse(res, event);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/timeline
router.post('/admin/timeline', protect, upload.single('image'), async (req, res, next) => {
  try {
    const event = await Timeline.create(req.body);
    return successResponse(res, event, 'Timeline event created successfully', 201);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/timeline/:id
router.put('/admin/timeline/:id', protect, idValidation, validate, upload.single('image'), async (req, res, next) => {
  try {
    const event = await Timeline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    return successResponse(res, event, 'Timeline event updated successfully');
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/timeline/:id
router.delete('/admin/timeline/:id', protect, idValidation, validate, async (req, res, next) => {
  try {
    const event = await Timeline.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    return successResponse(res, null, 'Timeline event deleted successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;