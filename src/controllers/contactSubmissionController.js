const ContactSubmission = require('../models/ContactSubmission');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// @desc    Create contact submission (public)
// @route   POST /api/contact-submissions
// @access  Public
exports.createSubmission = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.create(req.body);
    return successResponse(res, submission, 'Your message has been sent successfully. We will get back to you soon!', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions (admin)
// @route   GET /api/admin/contact-submissions
// @access  Private
exports.getAllSubmissions = async (req, res, next) => {
  try {
    const {
      search,
      is_read,
      sort = 'created_at',
      order = 'desc',
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT
    } = req.query;
    
    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }
    
    // Read status filter
    if (is_read !== undefined) {
      query.is_read = is_read === 'true';
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };
    
    // Execute query
    const [submissions, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ContactSubmission.countDocuments(query)
    ]);
    
    return paginatedResponse(res, submissions, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }, 'Contact submissions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact submission
// @route   GET /api/admin/contact-submissions/:id
// @access  Private
exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, submission, 'Contact submission retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Mark submission as read
// @route   PATCH /api/admin/contact-submissions/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, submission, 'Marked as read successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact submission
// @route   DELETE /api/admin/contact-submissions/:id
// @access  Private
exports.deleteSubmission = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, null, 'Contact submission deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread submissions count
// @route   GET /api/admin/contact-submissions/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await ContactSubmission.countDocuments({ is_read: false });
    
    return successResponse(res, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};
