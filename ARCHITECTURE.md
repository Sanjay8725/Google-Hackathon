# System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           index.html (Static Home Page)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      src/js/api.js (API Helper Functions)            │   │
│  │  • api.login()      • api.getAllEvents()             │   │
│  │  • api.register()   • api.createEvent()              │   │
│  │  • api.checkIn()    • api.submitFeedback()           │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      src/js/app.js (Main Application Logic)          │   │
│  │  • navigateTo()           • loadOrganizerDashboard() │   │
│  │  • handleAuth()           • loadAttendeeDashboard()  │   │
│  │  • addNewEvent()          • viewEventAnalytics()     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP Requests (Fetch API)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            server/server.js (Main Server)            │   │
│  │         • Express App Setup                          │   │
│  │         • CORS Middleware                            │   │
│  │         • Static File Serving                        │   │
│  │         • Error Handling                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│          ┌───────────────────┼───────────────────┐          │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   AUTH       │   │   EVENTS     │   │  ATTENDANCE  │   │
│  │   ROUTES     │   │   ROUTES     │   │   ROUTES     │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   AUTH       │   │   EVENT      │   │  ATTENDANCE  │   │
│  │ CONTROLLER   │   │ CONTROLLER   │   │ CONTROLLER   │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│                              │                               │
│          ┌───────────────────┼───────────────────┐          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   FEEDBACK   │   │  ANALYTICS   │   │   DATABASE   │   │
│  │   ROUTES     │   │   ROUTES     │   │   CONFIG     │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│          │                   │                   │          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   FEEDBACK   │   │  ANALYTICS   │   │    mysql2    │   │
│  │ CONTROLLER   │   │ CONTROLLER   │   │ Connection   │   │
│  └──────────────┘   └──────────────┘   │     Pool     │   │
│                                         └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    SQL Queries
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL DATABASE                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  event_management Database                           │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   users    │  │   events   │  │registrations│    │   │
│  │  │ - id       │  │ - id       │  │ - id        │    │   │
│  │  │ - name     │  │ - title    │  │ - event_id  │    │   │
│  │  │ - email    │  │ - date     │  │ - user_id   │    │   │
│  │  │ - password │  │ - location │  │ - qr_code   │    │   │
│  │  │ - role     │  │ - status   │  └────────────┘    │   │
│  │  └────────────┘  └────────────┘                     │   │
│  │                                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ attendance │  │  feedback  │  │ analytics  │     │   │
│  │  │ - id       │  │ - id       │  │ - id       │     │   │
│  │  │ - event_id │  │ - event_id │  │ - event_id │     │   │
│  │  │ - user_id  │  │ - user_id  │  │ - metric   │     │   │
│  │  │ - checkin  │  │ - rating   │  │ - value    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                       │   │
│  │  ┌────────────────────┐                              │   │
│  │  │  engagement_logs   │                              │   │
│  │  │  - id              │                              │   │
│  │  │  - event_id        │                              │   │
│  │  │  - user_id         │                              │   │
│  │  │  - action          │                              │   │
│  │  │  - timestamp       │                              │   │
│  │  └────────────────────┘                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Registration Flow
```
User fills form → Frontend (app.js) → api.register() →
HTTP POST /api/auth/register → authController.register() →
bcrypt.hash(password) → INSERT INTO users → Response
```

### 2. Event Creation Flow
```
Organizer creates event → handleEventCreate() → api.createEvent() →
HTTP POST /api/events → eventController.createEvent() →
INSERT INTO events → Response → Update UI
```

### 3. QR Check-in Flow
```
Scanner reads QR → simulateQRScan() → api.checkIn() →
HTTP POST /api/attendance/checkin → attendanceController.checkIn() →
Verify registration → INSERT INTO attendance → 
UPDATE events SET checked_in++ → Response
```

### 4. Analytics Flow
```
View analytics → viewEventAnalytics() → api.getEventAnalytics() →
HTTP GET /api/analytics/event/:id → analyticsController.getEventAnalytics() →
Complex JOIN queries → Calculate metrics → Response → Display modal
```

## API Endpoint Summary

### Authentication (`/api/auth`)
- POST `/register` - Create new user account
- POST `/login` - Authenticate user
- GET `/profile/:id` - Get user profile

### Events (`/api/events`)
- GET `/` - List all events
- GET `/:id` - Get single event
- POST `/` - Create new event
- PUT `/:id` - Update event
- DELETE `/:id` - Delete event
- GET `/organizer/:id` - Get organizer's events
- POST `/:id/register` - Register for event
- GET `/:id/registrations` - Get registrations

### Attendance (`/api/attendance`)
- POST `/checkin` - QR check-in
- GET `/event/:id` - Event attendance
- GET `/user/:id` - User attendance history
- POST `/qr-scan` - Validate QR code

### Feedback (`/api/feedback`)
- POST `/` - Submit feedback
- GET `/event/:id` - Get event feedback
- GET `/stats/:id` - Feedback statistics

### Analytics (`/api/analytics`)
- GET `/event/:id` - Event analytics
- GET `/dashboard/:id` - Dashboard stats
- POST `/track` - Track engagement

## Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Fetch API for HTTP requests
- LocalStorage for auth persistence
- Dynamic DOM manipulation

**Backend:**
- Node.js (Runtime)
- Express.js (Web Framework)
- mysql2 (MySQL Driver)
- bcrypt (Password Hashing)
- cors (Cross-Origin Resource Sharing)
- dotenv (Environment Variables)

**Database:**
- MySQL 5.7+
- 8 Tables with relationships
- Indexes for performance
- Foreign key constraints

**Security:**
- bcrypt password hashing (10 rounds)
- Parameterized SQL queries
- CORS configuration
- Input validation
- Environment variable protection
