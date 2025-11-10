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
  citations: {
    type: Number,
    default: 0,
    min: 0
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