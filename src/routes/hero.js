const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const { protect } = require('../middleware/auth');
const { successResponse } = require('../utils/apiResponse');

// @route   GET /api/hero
router.get('/hero', async (req, res, next) => {
  try {
    let hero = await Hero.findOne();
    
    if (!hero) {
      hero = await Hero.create({
        title: "Pioneering the Future of AI",
        subtitle: "King's Lab",
        description: "We are a world-class research laboratory",
        cta_primary_text: "Explore Research",
        cta_secondary_text: "Meet the Team"
      });
    }
    
    return successResponse(res, hero);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/hero
router.put('/admin/hero', protect, async (req, res, next) => {
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
});

module.exports = router;