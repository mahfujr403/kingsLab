const express = require('express');
const router = express.Router();
const ContactSubmission = require('../models/ContactSubmission');
const { protect } = require('../middleware/auth');
const { contactSubmissionValidation, idValidation, validate } = require('../middleware/validator');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// @route   POST /api/contact-submissions (Public)
router.post('/contact-submissions', contactSubmissionValidation, validate, async (req, res, next) => {
  try {
    const submission = await ContactSubmission.create(req.body);
    return successResponse(res, submission, 'Your message has been sent successfully', 201);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/contact-submissions
router.get('/admin/contact-submissions', protect, async (req, res, next) => {
  try {
    const {
      search,
      is_read,
      sort = 'created_at',
      order = 'desc',
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }
    
    if (is_read !== undefined) {
      query.is_read = is_read === 'true';
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };
    
    const [submissions, total] = await Promise.all([
      ContactSubmission.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      ContactSubmission.countDocuments(query)
    ]);
    
    return paginatedResponse(res, submissions, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/contact-submissions/:id
router.get('/admin/contact-submissions/:id', protect, idValidation, validate, async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, submission);
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/contact-submissions/:id/read
router.patch('/admin/contact-submissions/:id/read', protect, idValidation, validate, async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, submission, 'Marked as read');
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/contact-submissions/:id
router.delete('/admin/contact-submissions/:id', protect, idValidation, validate, async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
    
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }
    
    return successResponse(res, null, 'Submission deleted successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;