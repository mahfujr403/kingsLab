const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // Publication indexes
    const Publication = require('../models/Publication');
    await Publication.collection.createIndex({ title: 'text', abstract: 'text', authors: 'text' });
    await Publication.collection.createIndex({ year: -1 });
    await Publication.collection.createIndex({ citations: -1 });

    // Team Member indexes
    const TeamMember = require('../models/TeamMember');
    await TeamMember.collection.createIndex({ name: 'text', bio: 'text' });
    await TeamMember.collection.createIndex({ role: 1 });

    // Research Area indexes
    const ResearchArea = require('../models/ResearchArea');
    await ResearchArea.collection.createIndex({ title: 'text', description: 'text' });
    await ResearchArea.collection.createIndex({ order: 1 });

    // Contact Submission indexes
    const ContactSubmission = require('../models/ContactSubmission');
    await ContactSubmission.collection.createIndex({ created_at: -1 });
    await ContactSubmission.collection.createIndex({ is_read: 1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = connectDB;