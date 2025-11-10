const Hero = require('../models/Hero');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get hero section data
// @route   GET /api/hero
// @access  Public
exports.getHero = async (req, res, next) => {
  try {
    let hero = await Hero.findOne();
    
    if (!hero) {
      // Create default hero section if not exists
      hero = await Hero.create({
        title: "Pioneering the Future of AI",
        subtitle: "King's Lab",
        description: "We are a world-class research laboratory pushing the boundaries of artificial intelligence, machine learning, and deep learning to solve complex real-world problems.",
        cta_primary_text: "Explore Research",
        cta_primary_link: "#research",
        cta_secondary_text: "Meet the Team",
        cta_secondary_link: "#team"
      });
    }
    
    return successResponse(res, hero, 'Hero section retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update hero section
// @route   PUT /api/admin/hero
// @access  Private
exports.updateHero = async (req, res, next) => {
  try {
    let hero = await Hero.findOne();
    
    if (!hero) {
      hero = await Hero.create(req.body);
    } else {
      hero = await Hero.findByIdAndUpdate(
        hero._id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    return successResponse(res, hero, 'Hero section updated successfully');
  } catch (error) {
    next(error);
  }
};
