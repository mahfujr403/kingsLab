const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login admin user
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    return successResponse(res, {
      user: user.getPublicProfile(),
      token
    }, 'Login successful', 200);

  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/admin/user
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user.getPublicProfile(), 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/admin/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In a JWT system, logout is typically handled client-side
    // But we can add token to a blacklist if needed
     // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add token to the blacklist with an expiration matching the token's expiration
    redisClient.setex(decoded.jti, decoded.exp - Math.floor(Date.now() / 1000), token, (err) => {
      if (err) {
        return next(err);
      }
    });
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};