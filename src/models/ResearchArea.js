const mongoose = require('mongoose');

const researchAreaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  details: {
    type: String,
    required: [true, 'Details are required']
  },
  icon: {
    type: String,
    trim: true,
    default: 'Brain'
  },
  image: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
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

// Index for text search
researchAreaSchema.index({ title: 'text', description: 'text', details: 'text' });

// Index for sorting
researchAreaSchema.index({ order: 1, created_at: -1 });

module.exports = mongoose.model('ResearchArea', researchAreaSchema);