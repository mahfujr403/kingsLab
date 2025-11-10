const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  background_image: {
    type: String,
    trim: true
  },
  cta_primary_text: {
    type: String,
    trim: true,
    default: 'Explore Research'
  },
  cta_primary_link: {
    type: String,
    trim: true,
    default: '#research'
  },
  cta_secondary_text: {
    type: String,
    trim: true,
    default: 'Meet the Team'
  },
  cta_secondary_link: {
    type: String,
    trim: true,
    default: '#team'
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Hero', heroSchema);