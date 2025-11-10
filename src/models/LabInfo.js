const mongoose = require('mongoose');

const labInfoSchema = new mongoose.Schema({
  lab_name: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  tagline: {
    type: String,
    required: [true, 'Tagline is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  email: {
    type: String,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.model('LabInfo', labInfoSchema);