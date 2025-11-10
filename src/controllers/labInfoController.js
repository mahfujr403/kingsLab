const LabInfo = require('../models/LabInfo');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get lab information
// @route   GET /api/lab-info
// @access  Public
exports.getLabInfo = async (req, res, next) => {
  try {
    let labInfo = await LabInfo.findOne();
    
    if (!labInfo) {
      // Create default lab info if not exists
      labInfo = await LabInfo.create({
        lab_name: "King's Lab",
        tagline: "Advancing Artificial Intelligence Research",
        description: "A cutting-edge research laboratory focused on deep learning, computer vision, and natural language processing.",
        email: "info@kingslab.ai"
      });
    }
    
    return successResponse(res, labInfo, 'Lab information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab information
// @route   PUT /api/admin/lab-info
// @access  Private
exports.updateLabInfo = async (req, res, next) => {
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
};
