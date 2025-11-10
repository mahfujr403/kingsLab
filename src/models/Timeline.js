const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 10, 'Year is too far in the future']
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
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

// Index for sorting by date
timelineSchema.index({ date: -1 });
timelineSchema.index({ year: -1, month: -1 });

// Set date from year and month if not provided
timelineSchema.pre('save', function(next) {
  if (!this.date && this.year) {
    const month = this.month || 1;
    this.date = new Date(this.year, month - 1, 1);
  }
  next();
});

module.exports = mongoose.model('Timeline', timelineSchema);