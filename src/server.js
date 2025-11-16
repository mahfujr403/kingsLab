const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const labInfoRoutes = require('./routes/labInfo');
const heroRoutes = require('./routes/hero');
const contactInfoRoutes = require('./routes/contactInfo');
const researchAreaRoutes = require('./routes/researchArea');
const publicationRoutes = require('./routes/publication');
const teamMemberRoutes = require('./routes/teamMember');
const timelineRoutes = require('./routes/timeline');
const contactSubmissionRoutes = require('./routes/contactSubmission');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (more generous in development to avoid 429 spam)
let limiter;
if (process.env.NODE_ENV === 'development') {
  limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // allow many rapid local requests
    standardHeaders: true,
    legacyHeaders: false,
  });
} else {
  limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
}
app.use('/api/', limiter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'King\'s Lab API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api', labInfoRoutes);
app.use('/api', heroRoutes);
app.use('/api', contactInfoRoutes);
app.use('/api', researchAreaRoutes);
app.use('/api', publicationRoutes);
app.use('/api', teamMemberRoutes);
app.use('/api', timelineRoutes);
app.use('/api', contactSubmissionRoutes);
app.use('/api/admin', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);

    // Create default admin user if not exists
    const User = require('./models/User');
    const existingAdmin = await User.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });
    
    if (!existingAdmin) {
      await User.create({
        name: process.env.DEFAULT_ADMIN_NAME,
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: process.env.DEFAULT_ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('✅ Default admin user created');
      console.log(`📧 Email: ${process.env.DEFAULT_ADMIN_EMAIL}`);
      console.log(`🔑 Password: ${process.env.DEFAULT_ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;