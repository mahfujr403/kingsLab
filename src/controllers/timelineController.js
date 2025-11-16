const Timeline = require('../models/Timeline');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all timeline events
// @route   GET /api/timeline
// @access  Public
exports.getAllTimeline = async (req, res, next) => {
  try {
    const { year, sort = 'date', order = 'desc' } = req.query;
    
    // Build query
    const query = {};
    if (year) {
      query.year = parseInt(year, 10);
    }
    
    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };
    
    // Execute query
    const timeline = await Timeline.find(query).sort(sortOptions);
    
    return successResponse(res, timeline, 'Timeline events retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single timeline event
// @route   GET /api/timeline/:id
// @access  Public
exports.getTimelineEvent = async (req, res, next) => {
  try {
    const event = await Timeline.findById(req.params.id);
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    return successResponse(res, event, 'Timeline event retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create timeline event
// @route   POST /api/admin/timeline
// @access  Private
exports.createTimelineEvent = async (req, res, next) => {
  try {
    const data = { ...req.body };
    
    // Handle image upload if file is provided
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'timeline');
      data.image = result.url;
      data.image_public_id = result.public_id;
    }
    
    const event = await Timeline.create(data);
    return successResponse(res, event, 'Timeline event created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update timeline event
// @route   PUT /api/admin/timeline/:id
// @access  Private
exports.updateTimelineEvent = async (req, res, next) => {
  try {
    const event = await Timeline.findById(req.params.id);
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    const data = { ...req.body };
    
    // Handle new image upload if file is provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (event.image_public_id) {
        await deleteFromCloudinary(event.image_public_id);
      }
      
      // Upload new image
      const result = await uploadBufferToCloudinary(req.file.buffer, 'timeline');
      data.image = result.url;
      data.image_public_id = result.public_id;
    }
    
    const updatedEvent = await Timeline.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    
    return successResponse(res, updatedEvent, 'Timeline event updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete timeline event
// @route   DELETE /api/admin/timeline/:id
// @access  Private
exports.deleteTimelineEvent = async (req, res, next) => {
  try {
    const event = await Timeline.findById(req.params.id);
    
    if (!event) {
      return errorResponse(res, 'Timeline event not found', 404);
    }
    
    // Delete image from Cloudinary if exists
    if (event.image_public_id) {
      await deleteFromCloudinary(event.image_public_id);
    }
    
    await event.deleteOne();
    
    return successResponse(res, null, 'Timeline event deleted successfully');
  } catch (error) {
    next(error);
  }
};
