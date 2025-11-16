const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Bio is required']
  },
  photo_url: {
    type: String,
    trim: true
  },
  photo_public_id: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  website: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  // ResearchGate profile URL (was missing, add for social profiles)
  researchgate: {
    type: String,
    trim: true
  },
  google_scholar: {
    type: String,
    trim: true
  },
  expertise: [{
    type: String,
    trim: true
  }],
  education: [{
    type: String,
    trim: true
  }],
  publications_count: {
    type: Number,
    default: 0,
    min: 0
  },
  is_alumni: {
    type: Boolean,
    default: false
  },
  // Alumni related metadata (added to support admin UI)
  alumni_info: {
    type: String,
    trim: true
  },
  alumni_year: {
    type: Number,
    min: 1900,
    max: 2100
  },
  current_position: {
    type: String,
    trim: true
  },
  affiliation: {
    type: String,
    trim: true
  },
  join_date: {
    type: Date
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

// Indexes for search and filtering
teamMemberSchema.index({ name: 'text', bio: 'text' });
teamMemberSchema.index({ role: 1 });
teamMemberSchema.index({ is_alumni: 1 });
teamMemberSchema.index({ order: 1, created_at: -1 });

// Update publications count
teamMemberSchema.methods.updatePublicationsCount = async function() {
  const Publication = mongoose.model('Publication');
  const count = await Publication.countDocuments({
    author_ids: this._id
  });
  this.publications_count = count;
  await this.save();
};

module.exports = mongoose.model('TeamMember', teamMemberSchema);