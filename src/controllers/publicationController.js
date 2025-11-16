const Publication = require('../models/Publication');
const TeamMember = require('../models/TeamMember');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// @desc    Get all publications
// @route   GET /api/publications
// @access  Public
exports.getAllPublications = async (req, res, next) => {
  try {
    const {
      search,
      year,
      publication_type,
      author_id,
      sort = 'year',
      order = 'desc',
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Year filter
    if (year) {
      query.year = parseInt(year, 10);
    }

    // Publication type filter
    if (publication_type) {
      query.publication_type = publication_type;
    }

    // Author filter
    if (author_id) {
      query.author_ids = author_id;
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Execute query
    const [publications, total] = await Promise.all([
      Publication.find(query)
        .populate('author_ids', 'name role photo_url')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Publication.countDocuments(query)
    ]);

    return paginatedResponse(res, publications, {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single publication
// @route   GET /api/publications/:id
// @access  Public
exports.getPublication = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('author_ids', 'name role photo_url email website');

    if (!publication) {
      return errorResponse(res, 'Publication not found', 404);
    }

    return successResponse(res, publication, 'Publication retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create publication
// @route   POST /api/admin/publications
// @access  Private
exports.createPublication = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Normalize publication_type (already validated) to lowercase
    if (data.publication_type) {
      data.publication_type = String(data.publication_type).toLowerCase();
    }

    // Map journal/conference/book_chapter fields to venue if provided
    if (!data.venue) {
      if (data.journal) data.venue = data.journal;
      else if (data.conference) data.venue = data.conference;
      else if (data.book_chapter) data.venue = data.book_chapter;
    }

    // Parse author_ids (may arrive as comma string or repeated form fields)
    if (data.author_ids) {
      if (typeof data.author_ids === 'string') {
        // Comma or semicolon separated
        data.author_ids = data.author_ids
          .split(/[;,]/)
          .map(s => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(data.author_ids)) {
        data.author_ids = data.author_ids.map(s => String(s).trim()).filter(Boolean);
      }
    } else {
      data.author_ids = [];
    }

    // Build authors string from selectedAuthors if authors empty but author_ids provided (frontend sends names separately)
    if ((!data.authors || !data.authors.trim()) && Array.isArray(data.author_ids)) {
      // Fallback: attempt to resolve names from DB
      const names = [];
      for (const id of data.author_ids) {
        const tm = await TeamMember.findById(id).select('name');
        if (tm) names.push(tm.name);
      }
      if (names.length) {
        data.authors = names.join(', ');
      }
    }

    // Keywords: accept comma separated 'keywords' or single 'tag'
    if (data.keywords) {
      if (typeof data.keywords === 'string') {
        data.keywords = data.keywords
          .split(/[;,]/)
          .map(k => k.trim())
          .filter(Boolean);
      }
    } else {
      data.keywords = [];
    }
    if (data.tag) {
      // Ensure tag included in keywords for search purposes
      if (!Array.isArray(data.keywords)) data.keywords = [];
      if (!data.keywords.includes(data.tag)) data.keywords.push(data.tag);
    }

    // Map url field to pdf_url if pdf_url missing (frontend sends 'url')
    if (data.url && !data.pdf_url) {
      data.pdf_url = data.url;
    }
    
    // Handle file uploads if provided
    if (req.files) {
      // Handle certificate upload
      if (req.files.certificate && req.files.certificate[0]) {
        const result = await uploadBufferToCloudinary(req.files.certificate[0].buffer, 'publications/certificates');
        data.certificate_url = result.url;
        data.certificate_public_id = result.public_id;
      }
      
      // Handle event photo upload
      if (req.files.event_photo_file && req.files.event_photo_file[0]) {
        const result = await uploadBufferToCloudinary(req.files.event_photo_file[0].buffer, 'publications/events');
        data.event_photo = result.url;
        data.event_photo_public_id = result.public_id;
      }
    }
    
    const publication = await Publication.create(data);

    // Update publications count for all authors
    if (publication.author_ids && publication.author_ids.length > 0) {
      for (const authorId of publication.author_ids) {
        const author = await TeamMember.findById(authorId);
        if (author) {
          await author.updatePublicationsCount();
        }
      }
    }

    const populated = await Publication.findById(publication._id)
      .populate('author_ids', 'name role');

    return successResponse(res, populated, 'Publication created successfully', 201);
  } catch (error) {
    console.error('CreatePublication Error:', error);
    next(error);
  }
};

// @desc    Update publication
// @route   PUT /api/admin/publications/:id
// @access  Private
exports.updatePublication = async (req, res, next) => {
  try {
    const oldPublication = await Publication.findById(req.params.id);
    
    if (!oldPublication) {
      return errorResponse(res, 'Publication not found', 404);
    }
    
    const data = { ...req.body };

    if (data.publication_type) {
      data.publication_type = String(data.publication_type).toLowerCase();
    }

    if (!data.venue) {
      if (data.journal) data.venue = data.journal;
      else if (data.conference) data.venue = data.conference;
      else if (data.book_chapter) data.venue = data.book_chapter;
    }

    if (data.author_ids) {
      if (typeof data.author_ids === 'string') {
        data.author_ids = data.author_ids
          .split(/[;,]/)
          .map(s => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(data.author_ids)) {
        data.author_ids = data.author_ids.map(s => String(s).trim()).filter(Boolean);
      }
    }

    if (data.keywords) {
      if (typeof data.keywords === 'string') {
        data.keywords = data.keywords
          .split(/[;,]/)
          .map(k => k.trim())
          .filter(Boolean);
      }
    }
    if (data.tag) {
      if (!Array.isArray(data.keywords)) data.keywords = [];
      if (!data.keywords.includes(data.tag)) data.keywords.push(data.tag);
    }

    if (data.url && !data.pdf_url) {
      data.pdf_url = data.url;
    }
    
    // Handle file uploads if provided
    if (req.files) {
      // Handle certificate upload
      if (req.files.certificate && req.files.certificate[0]) {
        // Delete old certificate from Cloudinary if exists
        if (oldPublication.certificate_public_id) {
          await deleteFromCloudinary(oldPublication.certificate_public_id);
        }
        
        const result = await uploadBufferToCloudinary(req.files.certificate[0].buffer, 'publications/certificates');
        data.certificate_url = result.url;
        data.certificate_public_id = result.public_id;
      }
      
      // Handle event photo upload
      if (req.files.event_photo_file && req.files.event_photo_file[0]) {
        // Delete old event photo from Cloudinary if exists
        if (oldPublication.event_photo_public_id) {
          await deleteFromCloudinary(oldPublication.event_photo_public_id);
        }
        
        const result = await uploadBufferToCloudinary(req.files.event_photo_file[0].buffer, 'publications/events');
        data.event_photo = result.url;
        data.event_photo_public_id = result.public_id;
      }
    }

    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true
      }
    ).populate('author_ids', 'name role');

    // Update publications count if authors changed
    const oldAuthorIds = oldPublication.author_ids.map(id => id.toString());
    const newAuthorIds = publication.author_ids.map(id => id._id.toString());
    
    const authorsToUpdate = new Set([...oldAuthorIds, ...newAuthorIds]);
    
    for (const authorId of authorsToUpdate) {
      const author = await TeamMember.findById(authorId);
      if (author) {
        await author.updatePublicationsCount();
      }
    }

    return successResponse(res, publication, 'Publication updated successfully');
  } catch (error) {
    console.error('UpdatePublication Error:', error);
    next(error);
  }
};

// @desc    Delete publication
// @route   DELETE /api/admin/publications/:id
// @access  Private
exports.deletePublication = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return errorResponse(res, 'Publication not found', 404);
    }
    
    // Delete files from Cloudinary if they exist
    if (publication.certificate_public_id) {
      await deleteFromCloudinary(publication.certificate_public_id);
    }
    if (publication.event_photo_public_id) {
      await deleteFromCloudinary(publication.event_photo_public_id);
    }

    // Update publications count for all authors
    if (publication.author_ids && publication.author_ids.length > 0) {
      for (const authorId of publication.author_ids) {
        const author = await TeamMember.findById(authorId);
        if (author) {
          await author.updatePublicationsCount();
        }
      }
    }

    await publication.deleteOne();

    return successResponse(res, null, 'Publication deleted successfully');
  } catch (error) {
    next(error);
  }
};