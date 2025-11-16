const ResearchArea = require('../models/ResearchArea');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// @desc    Get all research areas
// @route   GET /api/research-areas
// @access  Public
exports.getAllResearchAreas = async (req, res, next) => {
  try {
    const {
      search,
      icon,
      sort = 'order',
      order = 'asc',
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Icon filter
    if (icon) {
      query.icon = icon;
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Execute query
    const [researchAreas, total] = await Promise.all([
      ResearchArea.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ResearchArea.countDocuments(query)
    ]);

    return paginatedResponse(res, researchAreas, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single research area
// @route   GET /api/research-areas/:id
// @access  Public
exports.getResearchArea = async (req, res, next) => {
  try {
    const researchArea = await ResearchArea.findById(req.params.id);

    if (!researchArea) {
      return errorResponse(res, 'Research area not found', 404);
    }

    return successResponse(res, researchArea, 'Research area retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create research area
// @route   POST /api/admin/research-areas
// @access  Private
exports.createResearchArea = async (req, res, next) => {
  try {
    const data = { ...req.body };
    
    // Handle image upload if file is provided
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'research-areas');
      data.image = result.url;
      data.image_public_id = result.public_id;
    }
    
    const researchArea = await ResearchArea.create(data);
    return successResponse(res, researchArea, 'Research area created successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'Research area with this title already exists', 400);
    }
    next(error);
  }
};

// @desc    Update research area
// @route   PUT /api/admin/research-areas/:id
// @access  Private
exports.updateResearchArea = async (req, res, next) => {
  try {
    const researchArea = await ResearchArea.findById(req.params.id);
    
    if (!researchArea) {
      return errorResponse(res, 'Research area not found', 404);
    }
    
    const data = { ...req.body };
    
    // Handle new image upload if file is provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (researchArea.image_public_id) {
        await deleteFromCloudinary(researchArea.image_public_id);
      }
      
      // Upload new image
      const result = await uploadBufferToCloudinary(req.file.buffer, 'research-areas');
      data.image = result.url;
      data.image_public_id = result.public_id;
    }
    
    const updatedResearchArea = await ResearchArea.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

    return successResponse(res, updatedResearchArea, 'Research area updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 'Research area with this title already exists', 400);
    }
    next(error);
  }
};

// @desc    Delete research area
// @route   DELETE /api/admin/research-areas/:id
// @access  Private
exports.deleteResearchArea = async (req, res, next) => {
  try {
    const researchArea = await ResearchArea.findById(req.params.id);

    if (!researchArea) {
      return errorResponse(res, 'Research area not found', 404);
    }
    
    // Delete image from Cloudinary if exists
    if (researchArea.image_public_id) {
      await deleteFromCloudinary(researchArea.image_public_id);
    }

    await researchArea.deleteOne();

    return successResponse(res, null, 'Research area deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder research areas
// @route   PATCH /api/admin/research-areas/reorder
// @access  Private
exports.reorderResearchAreas = async (req, res, next) => {
  try {
    let { items, ordered_ids } = req.body;

    // Support legacy/new frontend payload shape
    // Frontend currently sends { ordered_ids: [id1,id2,...] }
    if (!items && Array.isArray(ordered_ids)) {
      items = ordered_ids.map((id, index) => ({ id, order: index }));
    }

    if (!Array.isArray(items)) {
      return errorResponse(res, 'Payload must include items[] or ordered_ids[]', 400);
    }

    // Basic validation of item shape
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        return errorResponse(res, 'Each item must have id and numeric order', 400);
      }
    }

    const updatePromises = items.map(item =>
      ResearchArea.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      )
    );
    await Promise.all(updatePromises);

    return successResponse(res, null, 'Research areas reordered successfully');
  } catch (error) {
    next(error);
  }
};