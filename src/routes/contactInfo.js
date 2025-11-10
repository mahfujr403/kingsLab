const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');
const { protect } = require('../middleware/auth');
const { successResponse } = require('../utils/apiResponse');

// @route   GET /api/contact-info
router.get('/contact-info', async (req, res, next) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      contactInfo = await ContactInfo.create({
        email: "contact@kingslab.ai",
        phone: "+1 (555) 123-4567",
        address: "123 Research Way, Innovation City"
      });
    }
    
    return successResponse(res, contactInfo);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/admin/contact-info
router.put('/admin/contact-info', protect, async (req, res, next) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      contactInfo = await ContactInfo.create(req.body);
    } else {
      contactInfo = await ContactInfo.findByIdAndUpdate(
        contactInfo._id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    return successResponse(res, contactInfo, 'Contact information updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;