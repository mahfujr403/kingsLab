const express = require('express');
const router = express.Router();
const {
  getAllTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadPhoto
} = require('../controllers/teamMemberController');
const { protect } = require('../middleware/auth');
const { teamMemberValidation, idValidation, validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

// Public routes
router.get('/team-members', getAllTeamMembers);
router.get('/team-members/:id', idValidation, validate, getTeamMember);

// Admin routes
router.post('/admin/team-members', protect, teamMemberValidation, validate, createTeamMember);
router.put('/admin/team-members/:id', protect, idValidation, teamMemberValidation, validate, updateTeamMember);
router.delete('/admin/team-members/:id', protect, idValidation, validate, deleteTeamMember);
router.post('/admin/team-members/:id/photo', protect, idValidation, validate, upload.single('photo'), uploadPhoto);

module.exports = router;