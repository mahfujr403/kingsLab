const TeamMember = require('../models/TeamMember');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');
const fs = require('fs').promises;

// @desc    Get all team members
// @route   GET /api/team-members
// @access  Public
exports.getAllTeamMembers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      is_alumni,
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

    // Role filter
    if (role) {
      query.role = new RegExp(role, 'i');
    }

    // Alumni filter
    if (is_alumni !== undefined) {
      query.is_alumni = is_alumni === 'true';
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Execute query
    const [teamMembers, total] = await Promise.all([
      TeamMember.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      TeamMember.countDocuments(query)
    ]);

    return paginatedResponse(res, teamMembers, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single team member
// @route   GET /api/team-members/:id
// @access  Public
exports.getTeamMember = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return errorResponse(res, 'Team member not found', 404);
    }

    // Get publications for this team member
    const Publication = require('../models/Publication');
    const publications = await Publication.find({
      author_ids: teamMember._id
    }).select('title year publication_type venue citations').sort({ year: -1 });

    const response = {
      ...teamMember.toObject(),
      publications
    };

    return successResponse(res, response, 'Team member retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create team member
// @route   POST /api/admin/team-members
// @access  Private
exports.createTeamMember = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.create(req.body);
    return successResponse(res, teamMember, 'Team member created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update team member
// @route   PUT /api/admin/team-members/:id
// @access  Private
exports.updateTeamMember = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!teamMember) {
      return errorResponse(res, 'Team member not found', 404);
    }

    return successResponse(res, teamMember, 'Team member updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team member
// @route   DELETE /api/admin/team-members/:id
// @access  Private
exports.deleteTeamMember = async (req, res, next) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return errorResponse(res, 'Team member not found', 404);
    }

    // Delete photo from Cloudinary if exists
    if (teamMember.photo_public_id) {
      await deleteFromCloudinary(teamMember.photo_public_id);
    }

    await teamMember.deleteOne();

    return successResponse(res, null, 'Team member deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload team member photo
// @route   POST /api/admin/team-members/:id/photo
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a file', 400);
    }

    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return errorResponse(res, 'Team member not found', 404);
    }

    // Delete old photo if exists
    if (teamMember.photo_public_id) {
      await deleteFromCloudinary(teamMember.photo_public_id);
    }

    // Upload to Cloudinary
    let photoUrl = '';
    let photoPublicId = '';

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.path, 'team-members');
      photoUrl = result.url;
      photoPublicId = result.public_id;
      
      // Delete local file
      await fs.unlink(req.file.path);
    } else {
      // Use local upload
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Update team member
    teamMember.photo_url = photoUrl;
    teamMember.photo_public_id = photoPublicId;
    await teamMember.save();

    return successResponse(res, teamMember, 'Photo uploaded successfully');
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};