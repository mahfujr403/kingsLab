const express = require('express');
const router = express.Router();
const { login, getCurrentUser, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, validate } = require('../middleware/validator');

// @route   POST /api/admin/login
router.post('/login', loginValidation, validate, login);

// @route   GET /api/admin/user
router.get('/user', protect, getCurrentUser);

// @route   POST /api/admin/logout
router.post('/logout', protect, logout);

module.exports = router;