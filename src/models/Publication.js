const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  authors: {
    type: String,
    required: [true, 'Authors are required'],
    trim: true
  },
  author_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }],
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  publication_type: {
    type: String,
    required: [true, 'Publication type is required'],
    enum: [
      'journal',
      'conference',
      'workshop',
      'book',
      'book_chapter',
      'preprint',
      'technical_report',
      'review paper'
    ],
    default: 'conference'
  },
  // Additional classification fields used by frontend UI
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  tag: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    // required: [true, 'Venue is required'],
    trim: true
  },
  abstract: {
    type: String,
    trim: true
  },
  doi: {
    type: String,
    trim: true
  },
  pdf_url: {
    type: String,
    trim: true
  },
  // Generic URL (frontend sends 'url'); map to pdf_url if needed but store separately
  url: {
    type: String,
    trim: true
  },
  certificate_url: {
    type: String,
    trim: true
  },
  certificate_public_id: {
    type: String,
    trim: true
  },
  event_photo: {
    type: String,
    trim: true
  },
  event_photo_public_id: {
    type: String,
    trim: true
  },
  citations: {
    type: Number,
    default: 0,
    min: 0
  },
  volume: {
    type: String,
    trim: true
  },
  issue: {
    type: String,
    trim: true
  },
  pages: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for search and filtering
publicationSchema.index({ title: 'text', abstract: 'text', authors: 'text' });
publicationSchema.index({ year: -1 });
publicationSchema.index({ publication_type: 1 });
publicationSchema.index({ citations: -1 });
publicationSchema.index({ author_ids: 1 });

// Virtual for formatted authors
publicationSchema.virtual('formatted_authors').get(function() {
  return this.authors.split(',').map(a => a.trim());
});

module.exports = mongoose.model('Publication', publicationSchema);