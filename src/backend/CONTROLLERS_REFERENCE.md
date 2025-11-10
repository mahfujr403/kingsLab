# Backend Controllers Reference Guide

## Overview
This document provides a comprehensive reference for all controllers required for the King's Lab backend API. Each controller handles specific business logic and database operations for different parts of the research lab website.

---

## 1. Auth Controller (`authController.js`)

**Purpose**: Handles user authentication and authorization for the admin panel.

**Location**: `/backend/src/controllers/authController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| POST | `/api/auth/register` | `register()` | No |
| POST | `/api/auth/login` | `login()` | No |
| POST | `/api/auth/logout` | `logout()` | Yes |
| GET | `/api/auth/me` | `getCurrentUser()` | Yes |
| PUT | `/api/auth/password` | `updatePassword()` | Yes |
| POST | `/api/auth/refresh` | `refreshToken()` | No |

### Key Features
- User registration with password hashing (bcrypt)
- JWT token generation and validation
- Secure password updates
- Token refresh mechanism
- Role-based access control (admin roles)
- Protected route middleware integration

### Security Features
- Password strength validation
- Rate limiting on login attempts
- Secure HTTP-only cookies for tokens
- Password hashing with salt rounds
- JWT expiration handling

---

## 2. Research Area Controller (`researchAreaController.js`)

**Purpose**: Manages research areas/focus domains of the lab (AI, Deep Learning, Computer Vision, NLP, Reinforcement Learning).

**Location**: `/backend/src/controllers/researchAreaController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/research-areas` | `getAllResearchAreas()` | No |
| GET | `/api/research-areas/:id` | `getResearchAreaById()` | No |
| POST | `/api/research-areas` | `createResearchArea()` | Yes (Admin) |
| PUT | `/api/research-areas/:id` | `updateResearchArea()` | Yes (Admin) |
| DELETE | `/api/research-areas/:id` | `deleteResearchArea()` | Yes (Admin) |
| PATCH | `/api/research-areas/:id/toggle-active` | `toggleActive()` | Yes (Admin) |

### Key Features
- CRUD operations for research areas
- Image upload support for area icons/illustrations
- Active/inactive status toggle
- Sorting by display order
- Filtering and pagination
- Rich text description support
- Related publications count aggregation

### Data Fields
- Title
- Description (rich text)
- Icon/Image URL
- Display order
- Active status
- Keywords/tags
- Related publications count

---

## 3. Publication Controller (`publicationController.js`)

**Purpose**: Manages academic publications, papers, and research outputs.

**Location**: `/backend/src/controllers/publicationController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/publications` | `getAllPublications()` | No |
| GET | `/api/publications/:id` | `getPublicationById()` | No |
| GET | `/api/publications/search` | `searchPublications()` | No |
| GET | `/api/publications/year/:year` | `getPublicationsByYear()` | No |
| POST | `/api/publications` | `createPublication()` | Yes (Admin) |
| PUT | `/api/publications/:id` | `updatePublication()` | Yes (Admin) |
| DELETE | `/api/publications/:id` | `deletePublication()` | Yes (Admin) |
| PATCH | `/api/publications/:id/featured` | `toggleFeatured()` | Yes (Admin) |

### Key Features
- Advanced search and filtering (title, authors, year, keywords)
- Year-based grouping
- Featured publications toggle
- PDF upload support
- Citation count tracking
- Multiple authors support
- Venue/conference/journal information
- DOI and external links
- Pagination and sorting

### Data Fields
- Title
- Authors (array)
- Abstract
- Year
- Venue/Conference/Journal
- DOI
- PDF URL
- External link
- Citation count
- Keywords/tags
- Featured status
- Research area reference
- Publication type (conference, journal, preprint)

---

## 4. Team Member Controller (`teamMemberController.js`)

**Purpose**: Manages lab team members, researchers, and staff profiles.

**Location**: `/backend/src/controllers/teamMemberController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/team-members` | `getAllTeamMembers()` | No |
| GET | `/api/team-members/:id` | `getTeamMemberById()` | No |
| GET | `/api/team-members/role/:role` | `getTeamMembersByRole()` | No |
| POST | `/api/team-members` | `createTeamMember()` | Yes (Admin) |
| PUT | `/api/team-members/:id` | `updateTeamMember()` | Yes (Admin) |
| DELETE | `/api/team-members/:id` | `deleteTeamMember()` | Yes (Admin) |
| PATCH | `/api/team-members/:id/order` | `updateDisplayOrder()` | Yes (Admin) |

### Key Features
- Role-based grouping (Principal Investigator, Postdoc, PhD Student, etc.)
- Profile image upload
- Social media links (Twitter, LinkedIn, GitHub, Google Scholar)
- Research interests/bio
- Display order management
- Active/alumni status
- Publications count aggregation

### Data Fields
- Full name
- Role/Position
- Profile image URL
- Bio/Description
- Email
- Research interests
- Education background
- Social media links (object)
- Display order
- Active status
- Join date
- Personal website
- Publications authored (count/reference)

---

## 5. Lab Info Controller (`labInfoController.js`)

**Purpose**: Manages general laboratory information, mission, vision, and about content.

**Location**: `/backend/src/controllers/labInfoController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/lab-info` | `getLabInfo()` | No |
| PUT | `/api/lab-info` | `updateLabInfo()` | Yes (Admin) |
| GET | `/api/lab-info/stats` | `getLabStats()` | No |

### Key Features
- Singleton pattern (single lab info document)
- Mission and vision statements
- Lab statistics (members count, publications count, etc.)
- Founding information
- Affiliations and partnerships
- Awards and achievements
- Rich text content support

### Data Fields
- Lab name
- Mission statement
- Vision statement
- About/Description
- Founding year
- Location
- Affiliations (array)
- Awards/Achievements (array)
- Research highlights
- Lab logo URL
- Statistics (auto-calculated)

---

## 6. Hero Controller (`heroController.js`)

**Purpose**: Manages hero section content, banners, and homepage highlights.

**Location**: `/backend/src/controllers/heroController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/hero` | `getActiveHero()` | No |
| GET | `/api/hero/all` | `getAllHeroes()` | Yes (Admin) |
| GET | `/api/hero/:id` | `getHeroById()` | Yes (Admin) |
| POST | `/api/hero` | `createHero()` | Yes (Admin) |
| PUT | `/api/hero/:id` | `updateHero()` | Yes (Admin) |
| DELETE | `/api/hero/:id` | `deleteHero()` | Yes (Admin) |
| PATCH | `/api/hero/:id/activate` | `activateHero()` | Yes (Admin) |

### Key Features
- Multiple hero versions support
- Active/inactive status (only one active at a time)
- Background image/video support
- Call-to-action buttons
- Scheduling (optional start/end dates)
- Animation settings

### Data Fields
- Title
- Subtitle
- Description
- Background image/video URL
- CTA buttons (array: text, link, style)
- Active status
- Display order
- Animation settings
- Overlay settings (opacity, color)
- Start/end date (optional scheduling)

---

## 7. Contact Info Controller (`contactInfoController.js`)

**Purpose**: Manages lab contact information, address, and communication details.

**Location**: `/backend/src/controllers/contactInfoController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/contact-info` | `getContactInfo()` | No |
| PUT | `/api/contact-info` | `updateContactInfo()` | Yes (Admin) |

### Key Features
- Singleton pattern (single contact info document)
- Multiple contact methods
- Office hours
- Location/address with map coordinates
- Social media links

### Data Fields
- Email address(es)
- Phone number(s)
- Office address
- Building/Room number
- Map coordinates (latitude, longitude)
- Office hours
- Social media links (object)
- Mailing address
- Department/Institution

---

## 8. Timeline Controller (`timelineController.js`)

**Purpose**: Manages lab timeline events, milestones, and history.

**Location**: `/backend/src/controllers/timelineController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/timeline` | `getAllTimelineEvents()` | No |
| GET | `/api/timeline/:id` | `getTimelineEventById()` | No |
| GET | `/api/timeline/year/:year` | `getTimelineEventsByYear()` | No |
| POST | `/api/timeline` | `createTimelineEvent()` | Yes (Admin) |
| PUT | `/api/timeline/:id` | `updateTimelineEvent()` | Yes (Admin) |
| DELETE | `/api/timeline/:id` | `deleteTimelineEvent()` | Yes (Admin) |

### Key Features
- Chronological ordering
- Year-based filtering
- Event categorization (achievement, publication, award, etc.)
- Image/media support
- Highlight important milestones

### Data Fields
- Title
- Description
- Date
- Year
- Event type/category
- Image URL
- Related links
- Highlight status
- Display order

---

## 9. Contact Submission Controller (`contactSubmissionController.js`)

**Purpose**: Handles contact form submissions from website visitors.

**Location**: `/backend/src/controllers/contactSubmissionController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| POST | `/api/contact-submissions` | `createContactSubmission()` | No |
| GET | `/api/contact-submissions` | `getAllContactSubmissions()` | Yes (Admin) |
| GET | `/api/contact-submissions/:id` | `getContactSubmissionById()` | Yes (Admin) |
| PATCH | `/api/contact-submissions/:id/read` | `markAsRead()` | Yes (Admin) |
| PATCH | `/api/contact-submissions/:id/status` | `updateStatus()` | Yes (Admin) |
| DELETE | `/api/contact-submissions/:id` | `deleteContactSubmission()` | Yes (Admin) |
| GET | `/api/contact-submissions/stats` | `getSubmissionStats()` | Yes (Admin) |

### Key Features
- Form validation
- Spam protection (rate limiting, honeypot)
- Read/unread status
- Status management (new, in-progress, resolved, archived)
- Email notification (optional)
- Statistics and filtering
- Search by name, email, or message content

### Data Fields
- Name
- Email
- Subject
- Message
- Phone (optional)
- Submission date
- Read status
- Response status
- Admin notes
- IP address (for spam protection)
- User agent

---

## 10. Dashboard Controller (`dashboardController.js`)

**Purpose**: Provides aggregated statistics and analytics for the admin dashboard.

**Location**: `/backend/src/controllers/dashboardController.js`

### Endpoints & Methods

| Method | Endpoint | Function | Auth Required |
|--------|----------|----------|---------------|
| GET | `/api/dashboard/stats` | `getDashboardStats()` | Yes (Admin) |
| GET | `/api/dashboard/recent-activity` | `getRecentActivity()` | Yes (Admin) |
| GET | `/api/dashboard/analytics` | `getAnalytics()` | Yes (Admin) |

### Key Features
- MongoDB aggregation pipelines
- Real-time statistics
- Recent activity tracking
- Trend analysis
- Content overview (counts of all entities)
- Recent contact submissions
- Publication statistics by year
- Team composition breakdown

### Statistics Provided
- Total research areas
- Total publications (overall and by year)
- Total team members (by role)
- Total contact submissions (new/unread)
- Recent activity (last 10 actions)
- Publication trends
- Popular research areas
- Contact submission trends
- System health metrics

---

## Controller Implementation Checklist

### Essential Features for All Controllers

- ✅ **Error Handling**: Try-catch blocks with meaningful error messages
- ✅ **Validation**: Input validation using express-validator or Joi
- ✅ **Authentication**: Protected routes using JWT middleware
- ✅ **Authorization**: Role-based access control
- ✅ **Pagination**: Limit and offset for list endpoints
- ✅ **Filtering**: Query parameter support for filtering
- ✅ **Sorting**: Configurable sort order
- ✅ **Logging**: Request/response logging for debugging
- ✅ **Status Codes**: Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- ✅ **Documentation**: JSDoc comments for all methods

### Common Patterns

#### Response Format
```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  error: "Error message",
  details: { ... } // Optional validation details
}

// Paginated Response
{
  success: true,
  data: [ ... ],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

#### Authentication Middleware
```javascript
const authMiddleware = require('../middleware/auth');

// Apply to protected routes
router.post('/api/resource', authMiddleware, controller.create);
```

#### File Upload Handling
```javascript
const upload = require('../middleware/upload');

// Single file upload
router.post('/api/resource', upload.single('image'), controller.create);

// Multiple files
router.post('/api/resource', upload.array('images', 5), controller.create);
```

---

## Database Models Reference

Each controller requires a corresponding Mongoose model. Models should be located in `/backend/src/models/`.

### Required Models
1. `User.js` - For authentication
2. `ResearchArea.js` - Research areas
3. `Publication.js` - Publications
4. `TeamMember.js` - Team members
5. `LabInfo.js` - Lab information
6. `Hero.js` - Hero sections
7. `ContactInfo.js` - Contact information
8. `Timeline.js` - Timeline events
9. `ContactSubmission.js` - Contact form submissions

---

## Middleware Requirements

### Authentication Middleware (`auth.js`)
- Verify JWT tokens
- Extract user information
- Check user roles/permissions

### Upload Middleware (`upload.js`)
- Configure Multer for file uploads
- File type validation
- File size limits
- Storage configuration (local or cloud)

### Validation Middleware (`validation.js`)
- Input validation schemas
- Sanitization
- Custom validation rules

### Error Handler Middleware (`errorHandler.js`)
- Centralized error handling
- Error logging
- Development vs production error messages

### Rate Limiting Middleware (`rateLimiter.js`)
- Prevent API abuse
- Different limits for different endpoints
- IP-based tracking

---

## API Routes Structure

```
/backend/src/routes/
├── auth.routes.js
├── researchArea.routes.js
├── publication.routes.js
├── teamMember.routes.js
├── labInfo.routes.js
├── hero.routes.js
├── contactInfo.routes.js
├── timeline.routes.js
├── contactSubmission.routes.js
└── dashboard.routes.js
```

Each route file should:
- Import the corresponding controller
- Define all endpoints
- Apply appropriate middleware
- Export the router

---

## Environment Variables

Controllers may require these environment variables:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/kings-lab

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRE=30d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Email (for contact form notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@kingslab.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Testing Guidelines

Each controller should have corresponding test files:

```
/backend/tests/
├── auth.test.js
├── researchArea.test.js
├── publication.test.js
├── teamMember.test.js
└── ...
```

### Test Coverage Requirements
- Unit tests for individual methods
- Integration tests for endpoint flows
- Authentication/authorization tests
- Validation tests
- Error handling tests

---

## Performance Considerations

### Database Optimization
- Create indexes on frequently queried fields
- Use MongoDB aggregation pipelines efficiently
- Implement pagination for large datasets
- Use select() to limit returned fields
- Implement caching for frequently accessed data

### Common Indexes
```javascript
// Example indexes for models
researchAreaSchema.index({ title: 1 });
publicationSchema.index({ year: -1, title: 1 });
teamMemberSchema.index({ role: 1, displayOrder: 1 });
contactSubmissionSchema.index({ createdAt: -1, readStatus: 1 });
```

---

## Security Best Practices

1. **Input Validation**: Validate all user inputs
2. **SQL Injection Prevention**: Use parameterized queries (Mongoose handles this)
3. **XSS Protection**: Sanitize HTML inputs
4. **CSRF Protection**: Implement CSRF tokens for state-changing operations
5. **Rate Limiting**: Prevent brute force attacks
6. **Secure Headers**: Use helmet.js
7. **CORS Configuration**: Whitelist allowed origins
8. **Password Security**: Use bcrypt with appropriate salt rounds
9. **JWT Security**: Short expiration times, secure storage
10. **File Upload Security**: Validate file types, scan for malware

---

## Deployment Checklist

Before deploying controllers to production:

- [ ] All environment variables configured
- [ ] Database indexes created
- [ ] Error handling tested
- [ ] Rate limiting configured
- [ ] File upload limits set
- [ ] CORS origins configured
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] API documentation generated
- [ ] Load testing completed
- [ ] Security audit performed

---

## Support and Maintenance

### Logging Strategy
- Use Winston or similar logging library
- Log levels: error, warn, info, debug
- Separate log files for different environments
- Rotate log files regularly

### Monitoring
- API response times
- Error rates
- Database query performance
- Memory usage
- CPU usage
- Request rates

### Version Control
- Use semantic versioning for API
- Maintain changelog
- Tag releases
- Document breaking changes

---

## Additional Resources

- Express.js Documentation: https://expressjs.com/
- Mongoose Documentation: https://mongoosejs.com/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- REST API Design Guidelines: https://restfulapi.net/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/

---

## Summary

This reference guide covers all 10 controllers required for the King's Lab backend:

1. **Auth Controller** - User authentication and authorization
2. **Research Area Controller** - Managing research focus areas
3. **Publication Controller** - Academic publications and papers
4. **Team Member Controller** - Lab team and staff profiles
5. **Lab Info Controller** - General lab information
6. **Hero Controller** - Homepage hero sections
7. **Contact Info Controller** - Contact details and location
8. **Timeline Controller** - Lab history and milestones
9. **Contact Submission Controller** - Contact form handling
10. **Dashboard Controller** - Admin analytics and statistics

All controllers follow RESTful conventions, implement proper authentication/authorization, include comprehensive error handling, and are production-ready with MongoDB integration.
