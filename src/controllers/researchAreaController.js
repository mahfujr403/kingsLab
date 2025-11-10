const ResearchArea = require('../models/ResearchArea');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
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
    const researchArea = await ResearchArea.create(req.body);
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
    const researchArea = await ResearchArea.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!researchArea) {
      return errorResponse(res, 'Research area not found', 404);
    }

    return successResponse(res, researchArea, 'Research area updated successfully');
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
    const researchArea = await ResearchArea.findByIdAndDelete(req.params.id);

    if (!researchArea) {
      return errorResponse(res, 'Research area not found', 404);
    }

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
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return errorResponse(res, 'Items must be an array', 400);
    }

    // Update all items
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