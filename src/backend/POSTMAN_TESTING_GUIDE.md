# Postman Testing Guide for King's Lab API

## Overview
This guide provides comprehensive instructions for testing all King's Lab backend API endpoints using Postman. The collection includes 60+ endpoints across 10 controllers with automatic authentication handling and response validation.

---

## Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Kings_Lab_API.postman_collection.json`
5. Click **Import**

### 2. Import the Environment

1. Click the **Environments** icon (⚙️) in the top right
2. Click **Import**
3. Select `Kings_Lab_API.postman_environment.json`
4. Click **Import**
5. Select **"King's Lab API - Local Development"** from the environment dropdown

### 3. Configure Environment Variables

Click on the environment and set:
- `base_url`: Your API URL (default: `http://localhost:5000`)
- `auth_token`: Leave empty (will be auto-populated after login)

---

## Testing Workflow

### Step 1: Start Your Backend Server

```bash
cd backend
npm start
# Server should be running on http://localhost:5000
```

### Step 2: Test Authentication First

#### A. Register Admin User
**Endpoint**: `POST /api/auth/register`

**Purpose**: Create the first admin user account

**Request Body**:
```json
{
  "name": "Admin User",
  "email": "admin@kingslab.com",
  "password": "Admin@123456",
  "role": "admin"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "Admin User",
    "email": "admin@kingslab.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User registered successfully"
}
```

**Note**: The `auth_token` environment variable is automatically saved!

#### B. Login
**Endpoint**: `POST /api/auth/login`

**Purpose**: Login and get authentication token

**Request Body**:
```json
{
  "email": "admin@kingslab.com",
  "password": "Admin@123456"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "Admin User",
    "email": "admin@kingslab.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

**✅ Token Auto-Saved**: The collection automatically saves the token to your environment!

---

## Testing Each Module

### 1. Research Areas

#### Test Sequence:

**1.1 Create a Research Area** (`POST /api/research-areas`)
```json
{
  "title": "Deep Learning",
  "description": "Advanced neural network architectures...",
  "icon": "brain-circuit",
  "imageUrl": "https://images.unsplash.com/photo-1677442136019...",
  "keywords": ["neural networks", "CNN", "transformers"],
  "displayOrder": 1,
  "isActive": true
}
```
✅ Expected: 201 Created
📝 Note: Copy the `_id` from response for next steps

**1.2 Get All Research Areas** (`GET /api/research-areas`)
- No auth required
- Try with query params: `?page=1&limit=10&sort=-createdAt&active=true`
- ✅ Expected: 200 OK with array of research areas

**1.3 Get Research Area by ID** (`GET /api/research-areas/:id`)
- Replace `:id` with the ID from step 1.1
- ✅ Expected: 200 OK with single research area

**1.4 Update Research Area** (`PUT /api/research-areas/:id`)
```json
{
  "title": "Deep Learning & Neural Networks",
  "keywords": ["neural networks", "CNN", "transformers", "GPT"]
}
```
✅ Expected: 200 OK with updated data

**1.5 Toggle Active Status** (`PATCH /api/research-areas/:id/toggle-active`)
- ✅ Expected: 200 OK with toggled status

**1.6 Delete Research Area** (`DELETE /api/research-areas/:id`)
- ⚠️ Test this last
- ✅ Expected: 200 OK with deletion message

---

### 2. Publications

#### Test Sequence:

**2.1 Create a Publication** (`POST /api/publications`)
```json
{
  "title": "Efficient Transformers for Real-Time Applications",
  "authors": [
    {
      "name": "Dr. Jane Smith",
      "order": 1,
      "isCorresponding": true
    }
  ],
  "abstract": "We propose a novel architecture...",
  "year": 2024,
  "venue": "NeurIPS 2024",
  "venueType": "conference",
  "doi": "10.1234/neurips2024.12345",
  "keywords": ["transformers", "efficiency", "real-time"],
  "citationCount": 15,
  "isFeatured": true
}
```

**2.2 Get All Publications** (`GET /api/publications`)
- Try different query params:
  - `?page=1&limit=10`
  - `?sort=-year`
  - `?featured=true`

**2.3 Search Publications** (`GET /api/publications/search`)
- `?q=neural networks`
- `?year=2024`
- `?author=Smith`

**2.4 Get Publications by Year** (`GET /api/publications/year/2024`)

**2.5 Update Publication** (`PUT /api/publications/:id`)

**2.6 Toggle Featured Status** (`PATCH /api/publications/:id/featured`)

**2.7 Delete Publication** (`DELETE /api/publications/:id`)

---

### 3. Team Members

#### Test Sequence:

**3.1 Create Team Member** (`POST /api/team-members`)
```json
{
  "name": "Dr. Sarah Johnson",
  "role": "Postdoc",
  "email": "sarah.johnson@kingslab.com",
  "imageUrl": "https://images.unsplash.com/photo-1494790108377...",
  "bio": "Dr. Johnson specializes in computer vision...",
  "researchInterests": ["Computer Vision", "Image Segmentation"],
  "education": [
    {
      "degree": "Ph.D. in Computer Science",
      "institution": "MIT",
      "year": 2022
    }
  ],
  "socialLinks": {
    "twitter": "https://twitter.com/sarahjohnson",
    "linkedin": "https://linkedin.com/in/sarahjohnson",
    "github": "https://github.com/sarahjohnson"
  },
  "displayOrder": 2,
  "isActive": true,
  "joinDate": "2023-01-15"
}
```

**3.2 Get All Team Members** (`GET /api/team-members`)

**3.3 Get Team Members by Role** (`GET /api/team-members/role/Postdoc`)
- Roles: Principal Investigator, Postdoc, PhD Student, Master Student, Research Assistant

**3.4 Get Team Member by ID** (`GET /api/team-members/:id`)

**3.5 Update Team Member** (`PUT /api/team-members/:id`)

**3.6 Update Display Order** (`PATCH /api/team-members/:id/order`)

**3.7 Delete Team Member** (`DELETE /api/team-members/:id`)

---

### 4. Lab Info

#### Test Sequence:

**4.1 Get Lab Info** (`GET /api/lab-info`)
- Public endpoint (no auth)
- ✅ Expected: 200 OK (might be empty initially)

**4.2 Update Lab Info** (`PUT /api/lab-info`)
```json
{
  "labName": "King's Lab",
  "tagline": "Advancing AI Research for a Better Tomorrow",
  "mission": "Our mission is to push the boundaries...",
  "vision": "To be a world-leading research laboratory...",
  "about": "King's Lab is a premier AI research laboratory...",
  "foundingYear": 2020,
  "location": "Massachusetts Institute of Technology, Cambridge, MA",
  "affiliations": ["MIT CSAIL", "NSF", "Google Research Partnership"],
  "awards": [
    {
      "title": "Best Paper Award - NeurIPS 2023",
      "year": 2023,
      "description": "For groundbreaking work..."
    }
  ],
  "researchHighlights": [
    "Over 100 publications in top-tier conferences",
    "15+ open-source projects with 10k+ GitHub stars"
  ]
}
```

**4.3 Get Lab Statistics** (`GET /api/lab-info/stats`)
- Returns computed statistics (publications count, team size, etc.)

---

### 5. Hero Sections

#### Test Sequence:

**5.1 Create Hero Section** (`POST /api/hero`)
```json
{
  "title": "Welcome to King's Lab",
  "subtitle": "Leading AI & Deep Learning Research",
  "description": "Pushing the boundaries of artificial intelligence...",
  "backgroundImage": "https://images.unsplash.com/photo-1635070041078...",
  "ctaButtons": [
    {
      "text": "Explore Research",
      "link": "/research",
      "style": "primary",
      "order": 1
    }
  ],
  "isActive": false,
  "displayOrder": 1,
  "overlaySettings": {
    "opacity": 0.6,
    "color": "#000000"
  }
}
```

**5.2 Get Active Hero** (`GET /api/hero`)
- Public endpoint

**5.3 Get All Heroes (Admin)** (`GET /api/hero/all`)

**5.4 Activate Hero** (`PATCH /api/hero/:id/activate`)
- Automatically deactivates all other heroes

**5.5 Update Hero** (`PUT /api/hero/:id`)

**5.6 Delete Hero** (`DELETE /api/hero/:id`)

---

### 6. Contact Info

#### Test Sequence:

**6.1 Get Contact Info** (`GET /api/contact-info`)
- Public endpoint

**6.2 Update Contact Info** (`PUT /api/contact-info`)
```json
{
  "email": "contact@kingslab.com",
  "phone": "+1 (617) 555-0123",
  "address": "32 Vassar Street, Cambridge, MA 02139",
  "building": "Stata Center",
  "room": "Room 456",
  "mapCoordinates": {
    "latitude": 42.361763,
    "longitude": -71.090686
  },
  "officeHours": {
    "monday": "9:00 AM - 5:00 PM",
    "tuesday": "9:00 AM - 5:00 PM"
  },
  "socialMedia": {
    "twitter": "https://twitter.com/kingslab",
    "linkedin": "https://linkedin.com/company/kingslab"
  }
}
```

---

### 7. Timeline

#### Test Sequence:

**7.1 Create Timeline Event** (`POST /api/timeline`)
```json
{
  "title": "Lab Founded",
  "description": "King's Lab was officially established at MIT...",
  "date": "2020-01-15",
  "year": 2020,
  "eventType": "milestone",
  "imageUrl": "https://images.unsplash.com/photo-1517245386807...",
  "isHighlight": true,
  "displayOrder": 1
}
```
Event types: milestone, publication, award, achievement, collaboration

**7.2 Get All Timeline Events** (`GET /api/timeline`)

**7.3 Get Timeline Events by Year** (`GET /api/timeline/year/2024`)

**7.4 Get Timeline Event by ID** (`GET /api/timeline/:id`)

**7.5 Update Timeline Event** (`PUT /api/timeline/:id`)

**7.6 Delete Timeline Event** (`DELETE /api/timeline/:id`)

---

### 8. Contact Submissions

#### Test Sequence:

**8.1 Submit Contact Form** (`POST /api/contact-submissions`)
- ⚠️ No auth required (public endpoint)
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "Research Collaboration Inquiry",
  "message": "I am interested in collaborating on deep learning research...",
  "phone": "+1 (555) 123-4567"
}
```

**8.2 Get All Contact Submissions (Admin)** (`GET /api/contact-submissions`)
- Filter by status: `?status=new`
- Filter by read status: `?readStatus=unread`
- Sort: `?sort=-createdAt`

**8.3 Get Contact Submission by ID** (`GET /api/contact-submissions/:id`)

**8.4 Mark as Read** (`PATCH /api/contact-submissions/:id/read`)
- Toggles read/unread status

**8.5 Update Submission Status** (`PATCH /api/contact-submissions/:id/status`)
```json
{
  "status": "in-progress",
  "adminNotes": "Following up with the inquiry via email."
}
```
Status options: new, in-progress, resolved, archived

**8.6 Get Submission Statistics** (`GET /api/contact-submissions/stats`)

**8.7 Delete Contact Submission** (`DELETE /api/contact-submissions/:id`)

---

### 9. Dashboard

#### Test Sequence:

**9.1 Get Dashboard Statistics** (`GET /api/dashboard/stats`)
- Returns comprehensive statistics:
  - Total research areas
  - Total publications (overall and by year)
  - Total team members (by role)
  - Total contact submissions (by status)
  - Recent activity

**9.2 Get Recent Activity** (`GET /api/dashboard/recent-activity`)
- Try: `?limit=10`
- Shows recent changes across all content types

**9.3 Get Analytics** (`GET /api/dashboard/analytics`)
- Try: `?period=month` (options: week, month, year)
- Returns trends and analytics data

---

## Advanced Testing Scenarios

### Scenario 1: Complete Content Workflow

1. **Create Research Area** → Save ID as `research_area_id`
2. **Create Publication** with `researchArea: research_area_id`
3. **Create Team Member** → Save ID as `team_member_id`
4. **Get Research Area by ID** → Verify publication count increased
5. **Search Publications** by research area
6. **Get Dashboard Stats** → Verify all counts are correct

### Scenario 2: Testing Filters and Pagination

**Research Areas**:
```
GET /api/research-areas?page=1&limit=5&sort=title
GET /api/research-areas?active=true
GET /api/research-areas?sort=-createdAt
```

**Publications**:
```
GET /api/publications?page=1&limit=10&sort=-year
GET /api/publications?featured=true
GET /api/publications/search?q=deep learning&year=2024
```

**Team Members**:
```
GET /api/team-members?role=PhD Student
GET /api/team-members?active=true&sort=displayOrder
```

### Scenario 3: Testing Error Handling

**Try These to Test Error Responses**:

1. **Invalid ID**:
   - `GET /api/research-areas/invalid-id-format`
   - ✅ Expected: 400 Bad Request

2. **Not Found**:
   - `GET /api/publications/65f1234567890abcdef99999`
   - ✅ Expected: 404 Not Found

3. **Missing Required Fields**:
   ```json
   POST /api/research-areas
   {
     "description": "Missing title field"
   }
   ```
   - ✅ Expected: 400 Bad Request with validation errors

4. **Unauthorized Access**:
   - Remove auth token from environment
   - Try: `POST /api/research-areas`
   - ✅ Expected: 401 Unauthorized
   - Re-add token after testing

5. **Invalid Email Format**:
   ```json
   POST /api/auth/register
   {
     "email": "invalid-email"
   }
   ```
   - ✅ Expected: 400 Bad Request

### Scenario 4: Testing Authentication Flow

1. **Login** → Get token
2. **Get Current User** → Verify user info
3. **Update Password** → Change password
4. **Logout** → Clear session
5. **Try Protected Endpoint** → Should fail with 401
6. **Login Again** with new password → Should succeed
7. **Change password back** to original

---

## Postman Features Used

### 1. Auto-Authentication
The collection automatically attaches the Bearer token to all authenticated requests.

**Pre-request Script** (Collection level):
```javascript
const token = pm.environment.get('auth_token');
if (token) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + token
    });
}
```

### 2. Auto-Save Token
Login and Register requests automatically save the token.

**Test Script** (Login/Register):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("auth_token", jsonData.token);
        console.log("Auth token saved!");
    }
}
```

### 3. Auto-Save Resource IDs
Create operations automatically save IDs for later use.

**Test Script** (Collection level):
```javascript
if (pm.response.code === 201) {
    try {
        const jsonData = pm.response.json();
        if (jsonData.data && jsonData.data._id) {
            const resourceName = pm.request.url.path[pm.request.url.path.length - 1];
            pm.environment.set('last_created_' + resourceName + '_id', jsonData.data._id);
        }
    } catch (e) {}
}
```

### 4. Response Logging
All responses are automatically logged to the console for debugging.

---

## Common Issues & Solutions

### Issue 1: "401 Unauthorized" on Protected Endpoints
**Solution**:
1. Make sure you've logged in first
2. Check that `auth_token` is set in environment
3. Token might be expired - login again

### Issue 2: "Cannot Connect to Server"
**Solution**:
1. Verify backend is running: `npm start`
2. Check `base_url` in environment matches your server
3. Check for CORS issues in server logs

### Issue 3: "Validation Error" on Create/Update
**Solution**:
1. Check request body matches the schema
2. Ensure all required fields are present
3. Check data types (strings, numbers, booleans)

### Issue 4: "404 Not Found"
**Solution**:
1. Verify the resource ID is correct
2. Check that the resource exists (create it first)
3. Ensure URL path is correct

### Issue 5: MongoDB Connection Error
**Solution**:
1. Verify MongoDB is running
2. Check `MONGODB_URI` in `.env` file
3. Check network connectivity to database

---

## Testing Checklist

### Authentication ✅
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user info
- [ ] Update password
- [ ] Refresh token
- [ ] Logout

### Research Areas ✅
- [ ] Create research area
- [ ] Get all research areas
- [ ] Get research area by ID
- [ ] Update research area
- [ ] Toggle active status
- [ ] Delete research area

### Publications ✅
- [ ] Create publication
- [ ] Get all publications
- [ ] Search publications
- [ ] Get publications by year
- [ ] Get publication by ID
- [ ] Update publication
- [ ] Toggle featured status
- [ ] Delete publication

### Team Members ✅
- [ ] Create team member
- [ ] Get all team members
- [ ] Get team members by role
- [ ] Get team member by ID
- [ ] Update team member
- [ ] Update display order
- [ ] Delete team member

### Lab Info ✅
- [ ] Get lab info
- [ ] Update lab info
- [ ] Get lab statistics

### Hero Sections ✅
- [ ] Create hero section
- [ ] Get active hero
- [ ] Get all heroes
- [ ] Get hero by ID
- [ ] Update hero
- [ ] Activate hero
- [ ] Delete hero

### Contact Info ✅
- [ ] Get contact info
- [ ] Update contact info

### Timeline ✅
- [ ] Create timeline event
- [ ] Get all timeline events
- [ ] Get timeline events by year
- [ ] Get timeline event by ID
- [ ] Update timeline event
- [ ] Delete timeline event

### Contact Submissions ✅
- [ ] Submit contact form
- [ ] Get all submissions (admin)
- [ ] Get submission by ID
- [ ] Mark as read
- [ ] Update submission status
- [ ] Get submission statistics
- [ ] Delete submission

### Dashboard ✅
- [ ] Get dashboard statistics
- [ ] Get recent activity
- [ ] Get analytics

---

## Performance Testing Tips

### 1. Pagination Testing
Create multiple resources and test pagination:
```
?page=1&limit=5
?page=2&limit=5
?page=3&limit=5
```

### 2. Sorting Testing
Test different sort options:
```
?sort=title
?sort=-title (descending)
?sort=createdAt
?sort=-createdAt
```

### 3. Filtering Testing
Combine multiple filters:
```
?active=true&sort=-createdAt&page=1&limit=10
```

### 4. Load Testing
Use Postman Collection Runner:
1. Select collection
2. Click "Run"
3. Set iterations (e.g., 100)
4. Check for errors or slow responses

---

## Export Test Results

### Generate Newman Report
1. Export collection from Postman
2. Install Newman: `npm install -g newman`
3. Run tests:
   ```bash
   newman run Kings_Lab_API.postman_collection.json \
     -e Kings_Lab_API.postman_environment.json \
     --reporters cli,html \
     --reporter-html-export report.html
   ```

---

## Best Practices

1. **Always Test in Order**:
   - Authentication first
   - Create resources before trying to read/update
   - Test delete operations last

2. **Use Environment Variables**:
   - Store IDs in environment for reuse
   - Use `{{base_url}}` instead of hardcoded URLs

3. **Check Response Status**:
   - 200: Success (GET, PUT)
   - 201: Created (POST)
   - 204: No Content (DELETE)
   - 400: Bad Request (validation error)
   - 401: Unauthorized (auth required)
   - 404: Not Found
   - 500: Server Error

4. **Save Frequently**:
   - Save collection after adding custom tests
   - Export collection for version control

5. **Document Your Tests**:
   - Add descriptions to requests
   - Use folders to organize
   - Add examples of successful responses

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: |
          newman run Kings_Lab_API.postman_collection.json \
            -e Kings_Lab_API.postman_environment.json \
            --bail
```

---

## Summary

This Postman collection provides:
- ✅ **60+ endpoints** across 10 controllers
- ✅ **Automatic authentication** handling
- ✅ **Auto-save tokens and IDs**
- ✅ **Comprehensive test coverage**
- ✅ **Real-world example data**
- ✅ **Error handling scenarios**
- ✅ **Public and protected endpoints**

**Happy Testing! 🚀**

For issues or questions, refer to:
- Backend documentation: `/backend/docs/`
- Controllers reference: `/backend/CONTROLLERS_REFERENCE.md`
- API endpoints: `/backend/src/routes/`
