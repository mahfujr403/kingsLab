const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }
  next();
};

// Login validation
exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Research Area validation
exports.researchAreaValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('details')
    .trim()
    .notEmpty()
    .withMessage('Details are required'),
  body('icon')
    .optional()
    .trim()
];

// Publication validation
exports.publicationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('authors')
    .trim()
    .notEmpty()
    .withMessage('Authors are required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be valid'),
  body('publication_type')
    .isIn(['journal', 'conference', 'workshop', 'book', 'book_chapter', 'preprint', 'thesis', 'technical_report'])
    .withMessage('Invalid publication type'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('citations')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Citations must be a positive number')
];

// Team Member validation
exports.teamMemberValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required'),
  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required')
    .isLength({ min: 10 })
    .withMessage('Bio must be at least 10 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// Timeline validation
exports.timelineValidation = [
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
    .withMessage('Year must be valid'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
];

// Contact Submission validation
exports.contactSubmissionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// ID parameter validation
exports.idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];