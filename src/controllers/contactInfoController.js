const ContactInfo = require('../models/ContactInfo');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get contact information
// @route   GET /api/contact-info
// @access  Public
exports.getContactInfo = async (req, res, next) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      // Create default contact info if not exists
      contactInfo = await ContactInfo.create({
        email: "contact@kingslab.ai",
        phone: "+1 (555) 123-4567",
        address: "123 Research Way, Innovation City, IC 12345",
        office_hours: "Monday - Friday: 9:00 AM - 5:00 PM",
        social_links: {
          twitter: "https://twitter.com/kingslab",
          linkedin: "https://linkedin.com/company/kingslab",
          github: "https://github.com/kingslab"
        }
      });
    }
    
    return successResponse(res, contactInfo, 'Contact information retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact information
// @route   PUT /api/admin/contact-info
// @access  Private
exports.updateContactInfo = async (req, res, next) => {
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
};
