const TeamMember = require('../models/TeamMember');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

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
    const data = { ...req.body };
    
    // Handle image upload if file is provided
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'team-members');
      data.image = result.url;
      data.photo_url = result.url;
      data.photo_public_id = result.public_id;
    }
    
    const teamMember = await TeamMember.create(data);
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
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return errorResponse(res, 'Team member not found', 404);
    }
    
    const data = { ...req.body };
    
    // Handle new photo upload if file is provided
    if (req.file) {
      // Delete old photo from Cloudinary if exists
      if (teamMember.photo_public_id) {
        await deleteFromCloudinary(teamMember.photo_public_id);
      }
      
      // Upload new photo
      const result = await uploadBufferToCloudinary(req.file.buffer, 'team-members');
      data.image = result.url;
      data.photo_url = result.url;
      data.photo_public_id = result.public_id;
    }
    
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

    return successResponse(res, updatedTeamMember, 'Team member updated successfully');
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

    // Upload to Cloudinary from buffer
    const result = await uploadBufferToCloudinary(req.file.buffer, 'team-members');
    
    // Update team member
    teamMember.photo_url = result.url;
    teamMember.image = result.url;
    teamMember.photo_public_id = result.public_id;
    await teamMember.save();

    return successResponse(res, teamMember, 'Photo uploaded successfully');
  } catch (error) {
    next(error);
  }
};