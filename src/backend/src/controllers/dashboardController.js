const { successResponse, errorResponse } = require('../utils/apiResponse');
const ResearchArea = require('../models/ResearchArea');
const Publication = require('../models/Publication');
const TeamMember = require('../models/TeamMember');
const ContactSubmission = require('../models/ContactSubmission');
const Timeline = require('../models/Timeline');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get all counts and recent data in parallel
    const [
      totalResearchAreas,
      totalPublications,
      totalTeamMembers,
      totalAlumni,
      totalSubmissions,
      unreadSubmissions,
      totalTimelineEvents,
      recentPublications,
      recentSubmissions,
      topCitedPublications
    ] = await Promise.all([
      ResearchArea.countDocuments(),
      Publication.countDocuments(),
      TeamMember.countDocuments({ is_alumni: false }),
      TeamMember.countDocuments({ is_alumni: true }),
      ContactSubmission.countDocuments(),
      ContactSubmission.countDocuments({ is_read: false }),
      Timeline.countDocuments(),
      Publication.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('author_ids', 'name role')
        .lean(),
      ContactSubmission.find()
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
      Publication.find()
        .sort({ citations: -1 })
        .limit(5)
        .populate('author_ids', 'name')
        .lean()
    ]);

    // Publications by year (last 5 years)
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
      },
      { $sort: { count: -1 } }
    ]);

    // Team members by role
    const teamMembersByRole = await TeamMember.aggregate([
      {
        $match: { is_alumni: false }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Submissions trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const submissionsTrend = await ContactSubmission.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Total citations
    const totalCitationsResult = await Publication.aggregate([
      {
        $group: {
          _id: null,
          totalCitations: { $sum: '$citations' }
        }
      }
    ]);
    const totalCitations = totalCitationsResult.length > 0 ? totalCitationsResult[0].totalCitations : 0;

    // Build response
    const stats = {
      overview: {
        totalResearchAreas,
        totalPublications,
        totalTeamMembers,
        totalAlumni,
        totalSubmissions,
        unreadSubmissions,
        totalTimelineEvents,
        totalCitations
      },
      charts: {
        publicationsByYear: publicationsByYear.map(item => ({
          year: item._id,
          count: item.count
        })),
        publicationsByType: publicationsByType.map(item => ({
          type: item._id,
          count: item.count
        })),
        teamMembersByRole: teamMembersByRole.map(item => ({
          role: item._id,
          count: item.count
        })),
        submissionsTrend: submissionsTrend.map(item => ({
          date: item._id,
          count: item.count
        }))
      },
      recent: {
        publications: recentPublications,
        submissions: recentSubmissions,
        topCitedPublications
      }
    };

    return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick overview stats
// @route   GET /api/admin/dashboard/overview
// @access  Private
exports.getQuickOverview = async (req, res, next) => {
  try {
    const [
      totalResearchAreas,
      totalPublications,
      totalTeamMembers,
      unreadSubmissions
    ] = await Promise.all([
      ResearchArea.countDocuments(),
      Publication.countDocuments(),
      TeamMember.countDocuments({ is_alumni: false }),
      ContactSubmission.countDocuments({ is_read: false })
    ]);

    const overview = {
      totalResearchAreas,
      totalPublications,
      totalTeamMembers,
      unreadSubmissions
    };

    return successResponse(res, overview, 'Quick overview retrieved successfully');
  } catch (error) {
    next(error);
  }
};
