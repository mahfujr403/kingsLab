const express = require('express');
const router = express.Router();
const LabInfo = require('../models/LabInfo');
const { protect } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route   GET /api/lab-info
router.get('/lab-info', async (req, res, next) => {
  try {
    let labInfo = await LabInfo.findOne();
    
    if (!labInfo) {
      // Create default lab info if not exists
    //   labInfo = await LabInfo.create({
    //     lab_name: "King's Lab",
    //     tagline: "Advancing Artificial Intelligence Research",
    //     description: "A cutting-edge research laboratory",
    //     email: "info@kingslab.ai"
    //   });
    }
    
    return successResponse(res, labInfo);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/lab-info
router.get('/admin/lab-info', protect, async (req, res, next) => {
  try {
    let labInfo = await LabInfo.findOne();

    // if (!labInfo) {
    //   labInfo = await LabInfo.create({
    //     lab_name: "King's Lab",
    //     tagline: "Advancing Artificial Intelligence Research",
    //     description: "A cutting-edge research laboratory",
    //     email: "info@kingslab.ai"
    //   });
    // }

    return successResponse(res, labInfo);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/lab-info
router.put('/admin/lab-info', protect, async (req, res, next) => {
  try {
    let labInfo = await LabInfo.findOne();
    
    if (!labInfo) {
      labInfo = await LabInfo.create(req.body);
    } else {
      labInfo = await LabInfo.findByIdAndUpdate(
        labInfo._id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    return successResponse(res, labInfo, 'Lab information updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;