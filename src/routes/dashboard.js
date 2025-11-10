const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { successResponse } = require('../utils/apiResponse');
const ResearchArea = require('../models/ResearchArea');
const Publication = require('../models/Publication');
const TeamMember = require('../models/TeamMember');
const ContactSubmission = require('../models/ContactSubmission');

// @route   GET /api/admin/dashboard/stats
router.get('/dashboard/stats', protect, async (req, res, next) => {
  try {
    const [
      totalResearchAreas,
      totalPublications,
      totalTeamMembers,
      totalAlumni,
      totalSubmissions,
      unreadSubmissions,
      recentPublications,
      recentSubmissions
    ] = await Promise.all([
      ResearchArea.countDocuments(),
      Publication.countDocuments(),
      TeamMember.countDocuments({ is_alumni: false }),
      TeamMember.countDocuments({ is_alumni: true }),
      ContactSubmission.countDocuments(),
      ContactSubmission.countDocuments({ is_read: false }),
      Publication.find().sort({ created_at: -1 }).limit(5).populate('author_ids', 'name'),
      ContactSubmission.find().sort({ created_at: -1 }).limit(5)
    ]);

    // Publications by year
    const publicationsByYear = await Publication.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    // Publications by type
    const publicationsByType = await Publication.aggregate([
      {
        $group: {
          _id: '$publication_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      overview: {
        totalResearchAreas,
        totalPublications,
        totalTeamMembers,
        totalAlumni,
        totalSubmissions,
        unreadSubmissions
      },
      charts: {
        publicationsByYear: publicationsByYear.map(item => ({
          year: item._id,
          count: item.count
        })),
        publicationsByType: publicationsByType.map(item => ({
          type: item._id,
          count: item.count
        }))
      },
      recent: {
        publications: recentPublications,
        submissions: recentSubmissions
      }
    };

    return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;