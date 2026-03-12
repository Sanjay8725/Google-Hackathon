# 🏗️ EventFlow - System Architecture & Visual Guide

## System Components Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FRONTEND (HTML/CSS/JavaScript)                 │   │
│  │                                                           │   │
│  │  1. auth.html ─── Login/Signup Form                     │   │
│  │  2. auth.js ────── Form Logic & Validation             │   │
│  │  3. api.js ─────── API Client Wrapper                  │   │
│  │  4. AuthPage.css ─ Dark Theme Styling                  │   │
│  │                                                           │   │
│  │  Actions:                                                 │   │
│  │  • User enters credentials                               │   │
│  │  • Form validation happens                               │   │
│  │  • API request sent to backend                           │   │
│  │  • Response processed                                     │   │
│  │  • Redirect to dashboard                                 │   │
│  │  • User stored in localStorage                           │   │
│  └───────┬──────────────────────────────────────────────────┘   │
│          │                                                        │
│          │ HTTP POST/GET                                         │
│          │ JSON Payloads                                         │
│          │                                                        │
└──────────┼────────────────────────────────────────────────────────┘
           │
           │ INTERNET / CORS
           │
┌──────────▼────────────────────────────────────────────────────────┐
│                    SERVER (Backend - Node.js)                       │
│                      Port: 5000                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              SERVER.JS - Main Application                    │ │
│  │  • Express application setup                                 │ │
│  │  • Route middleware registration                             │ │
│  │  • CORS enabled                                              │ │
│  │  • Static file serving (frontend)                            │ │
│  │  • Error handling                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                             │                                      │
│  ┌─────────────────────────▼──────────────────────────────────┐  │
│  │         AUTHROUTES.JS - API Route Definitions              │  │
│  │                                                             │  │
│  │  POST /api/auth/login/admin                                │  │
│  │  POST /api/auth/login/organizer                            │  │
│  │  POST /api/auth/login/attendee                             │  │
│  │  POST /api/auth/register                                   │  │
│  │  GET  /api/health                                          │  │
│  │                                     ▲                       │  │
│  │                                     │                       │  │
│  └─────────────────────────────────────┼───────────────────────┘  │
│                                         │                         │
│  ┌─────────────────────────────────────▼───────────────────────┐  │
│  │      AUTHCONTROLLER.JS - Business Logic                    │  │
│  │                                                             │  │
│  │  register(req, res) {                                      │  │
│  │    • Validate input data                                   │  │
│  │    • Check email uniqueness                                │  │
│  │    • Check username uniqueness                             │  │
│  │    • Hash password with bcrypt                             │  │
│  │    • Insert into users table                               │  │
│  │    • Insert credentials                                    │  │
│  │    • Return user object + success                          │  │
│  │  }                                                          │  │
│  │                                                             │  │
│  │  loginByRole(req, res, role) {                             │  │
│  │    • Validate usernameOrEmail and password                 │  │
│  │    • Query users + credentials tables                      │  │
│  │    • Compare password with bcrypt                          │  │
│  │    • Return user object with role                          │  │
│  │  }                                                          │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
│                             │                                      │
│                             │ SQL Queries                          │
│                             │                                      │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              │ Database Connection
                              │ (mysql2/promise)
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                   DATABASE (MySQL)                                  │
│                  Database: event_management                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  USERS TABLE                          CREDENTIALS TABLES            │
│  ┌────────────────────────┐          ┌──────────────────────────┐  │
│  │ id (PK)                │          │ admin_credentials        │  │
│  │ name                   │          │ ├─ id (PK)              │  │
│  │ username (UNIQUE)      │◄─────────┤ ├─ user_id (FK)         │  │
│  │ email (UNIQUE)         │          │ └─ password_hash        │  │
│  │ role (admin/           │          │                         │  │
│  │       organizer/       │          │ organizer_credentials   │  │
│  │       attendee)        │          │ ├─ id (PK)              │  │
│  │ created_at             │◄─────────┤ ├─ user_id (FK)         │  │
│  │ updated_at             │          │ └─ password_hash        │  │
│  └────────────────────────┘          │                         │  │
│                                       │ attendee_credentials    │  │
│                                       │ ├─ id (PK)              │  │
│                                       │ ├─ user_id (FK)         │  │
│                                       │ └─ password_hash        │  │
│                                       └──────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow - Sequence Diagram

```
User                 Browser              Backend              Database
  │                    │                     │                    │
  │ 1. Enters          │                     │                    │
  │ Credentials ──────>│                     │                    │
  │                    │                     │                    │
  │                    │ 2. Validates        │                    │
  │                    │ (Check role,        │                    │
  │                    │  email/password)    │                    │
  │                    │                     │                    │
  │                    │ 3. POST /api/       │                    │
  │                    │    auth/login/{role}│                    │
  │                    ├───────────────────>│                    │
  │                    │                     │ 4. Query users     │
  │                    │                     │    + credentials   │
  │                    │                     ├───────────────────>│
  │                    │                     │                    │
  │                    │                     │<────────────────────│
  │                    │                     │ 4a. Return user    │
  │                    │                     │    record          │
  │                    │                     │                    │
  │                    │                     │ 5. Compare         │
  │                    │                     │    password        │
  │                    │                     │    (bcrypt)        │
  │                    │                     │                    │
  │                    │ 6. Response:        │                    │
  │                    │ {                   │                    │
  │                    │   success: true,    │                    │
  │                    │   user: {           │                    │
  │                    │     id: 1,          │                    │
  │                    │     name: "...",    │                    │
  │                    │     role: "admin"   │                    │
  │                    │   }                 │                    │
  │                    │ }<──────────────────│                    │
  │                    │                     │                    │
  │                    │ 7. Store in         │                    │
  │                    │ localStorage        │                    │
  │                    │                     │                    │
  │                    │ 8. Redirect to      │                    │
  │                    │ /admin/admin.html   │                    │
  │ 9. Dashboard ──────│                     │                    │
  │    Loads <─────────│                     │                    │
  │                    │                     │                    │
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INPUT VALIDATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser (auth.js):                                             │
│  • Check all fields filled                                      │
│  • Role selected                                                │
│  • Password not empty                                           │
│                                                                  │
│  Backend (authController.js):                                   │
│  • Check role is valid                                          │
│  • Check email format (for signup)                              │
│  • Check password not empty                                     │
│  • Check required fields present                                │
│                                                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE OPERATIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  For LOGIN:                                                      │
│  • Query: SELECT * FROM users WHERE (email = ? OR username = ?) │
│            JOIN credentials ON user_id                          │
│  • Check credentials table for role                             │
│  • Return user object if found                                  │
│                                                                  │
│  For SIGNUP:                                                     │
│  • Query: SELECT * FROM users WHERE email = ?                   │
│  • Query: SELECT * FROM users WHERE username = ?                │
│  • INSERT INTO users (name, username, email, role)              │
│  • INSERT INTO {role}_credentials (user_id, password_hash)      │
│  • Return new user object                                       │
│                                                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY OPERATIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Password Hashing (Signup):                                      │
│  • Input: plaintext password                                    │
│  • Process: bcrypt.hash(password, 10 salt rounds)               │
│  • Output: $2b$10$... (60 character hash)                       │
│  • Store: hash in credentials table                             │
│                                                                  │
│  Password Verification (Login):                                  │
│  • Input: user password + stored hash                           │
│  • Process: bcrypt.compare(input, hash)                         │
│  • Output: true or false                                        │
│  • Action: If true, create session; if false, reject            │
│                                                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE GENERATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Success Response (HTTP 200/201):                                │
│  {                                                               │
│    success: true,                                                │
│    message: "Login/Registration successful",                     │
│    user: {                                                       │
│      id: 1,                                                      │
│      name: "John Doe",                                           │
│      username: "johndoe",                                        │
│      email: "john@example.com",                                  │
│      role: "admin"                                               │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  Error Response (HTTP 400/401/403):                              │
│  {                                                               │
│    success: false,                                               │
│    message: "Email already registered"                           │
│  }                                                               │
│                                                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│               BROWSER CLIENT STATE MANAGEMENT                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  localStorage:                                                   │
│  • user: JSON stringified user object                            │
│  • selectedRole: user's selected role (temporary)                │
│                                                                  │
│  Then:                                                           │
│  • Clear selectedRole                                           │
│  • Redirect to dashboard based on role                          │
│  • Dashboard reads user from localStorage                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Role-Based Dashboard Routing

```
┌──────────────────────────────────────────────────────────────┐
│           User Successfully Authenticated                     │
│                  (user.role determined)                       │
└────────────┬─────────────────────────────────────────────────┘
             │
             ├─────────────────────┬──────────────────┬──────────────┐
             ▼                     ▼                  ▼              ▼
        admin role          organizer role        attendee role    unknown
             │                     │                  │              │
             ▼                     ▼                  ▼              ▼
    /admin/admin.html   /organizer/organizer-  /attendee/attendee- Error
                        dashboard.html         dashboard.html       Message
             │                     │                  │              │
             ▼                     ▼                  ▼              ▼
    Admin Dashboard    Organizer Dashboard    Attendee Dashboard  "Unknown
    • Manage users     • Create events        • View schedule      role"
    • System config    • Analytics            • Feedback
    • Reports          • Attendee mgmt        • QR codes
    • Settings         • Vendor mgmt          • Certificates
```

## Error Handling Flow

```
┌─ Try Backend Operation ─┐
│                         │
│  ┌────────────────────┐ │
│  │ Database Connected?│ │
│  └─────┬──────────────┘ │
│        │                │
│     NO│                │YES
│        ▼                ▼
│     503        ┌──────────────────┐
│  Database      │ Query Executed?  │
│  Unavailable   └─────┬────────────┘
│                      │
│                   NO│           │YES
│                      ▼           ▼
│                    500        ┌─────────────────┐
│                  Error        │ Row Exists?     │
│                               └─────┬───────────┘
│                                     │
│                              NO│      │YES (for login)
│                                 ▼      ▼
│                               401   ┌──────────────────┐
│                            Invalid  │ Password Valid?  │
│                            Creds    └─────┬────────────┘
│                                           │
│                                        NO│  │YES
│                                          ▼  ▼
│                                        401 200
│                                      Invalid Success
│                                      Creds  Login
│
└─────────────────────────────────────────────────────────┘
```

## File Dependency Graph

```
auth.html (Entry Point)
    ├── Loads auth.js
    │   ├── Calls window.api functions
    │   ├── Uses handleAuth() on form submit
    │   └── Uses localStorage
    │
    └── Loads api.js
        ├── Defines api.login()
        ├── Defines api.register()
        └── Points to http://localhost:5000/api

Backend Routes:
    server.js (Main)
        ├── Routes requests to authRoutes.js
        │
        └── authRoutes.js
            └── Calls authController.js functions
                ├── login handlers
                ├── register handler
                └── Query database via config/database.js

Database:
    schema.sql (Creates tables)
        ├── users table
        ├── admin_credentials
        ├── organizer_credentials
        └── attendee_credentials
    
    test_data.sql (Populates data)
    
    setup-credentials.js (Generates bcrypt hashes)
```

## Request/Response Cycle - Login Example

```
1. USER ACTION
   └─> Click Login button with credentials

2. BROWSER (auth.js)
   └─> Validate form → Call api.login()

3. NETWORK REQUEST
   POST http://localhost:5000/api/auth/login/admin
   Headers: { 'Content-Type': 'application/json' }
   Body: {
     "usernameOrEmail": "admin",
     "password": "admin123"
   }

4. SERVER (authRoutes.js)
   └─> Route matches → Call authController.loginAdmin()

5. DATABASE QUERY (authController.js)
   SELECT u.id, u.name, u.email, u.username, u.role, c.password_hash
   FROM users u
   JOIN admin_credentials c ON c.user_id = u.id
   WHERE u.username = ? AND u.role = ?
   
   Parameters: ["admin", "admin"]

6. BCRYPT VERIFICATION
   bcrypt.compare("admin123", "$2b$10$...")
   → Returns true/false

7. RESPONSE (HTTP 200)
   {
     "success": true,
     "message": "Login successful",
     "user": {
       "id": 1,
       "name": "Administrator",
       "email": "admin@admin.com",
       "username": "admin",
       "role": "admin"
     }
   }

8. BROWSER (auth.js)
   ├─> Store user in localStorage
   ├─> Clear selectedRole
   ├─> Set timeout 500ms
   └─> Redirect to /admin/admin.html

9. PAGE LOAD
   └─> admin-dashboard.html loads and reads user from localStorage
```

## Port Configuration

```
Frontend Served On:    http://localhost:5000 (via express.static)
                   OR http://localhost:3000 (if separate dev server)

Backend API On:        http://localhost:5000/api
Database (MySQL):      localhost:3306

Environment Variables (.env):
├─ DB_HOST=localhost
├─ DB_USER=root
├─ DB_PASS=your_password
├─ DB_NAME=event_management
├─ PORT=5000
└─ NODE_ENV=development
```

## Quick Reference: What Happens When...

### User Clicks Login
1. ✅ Form validates locally
2. ✅ handleAuth() sends login request
3. ✅ Backend queries users + credentials
4. ✅ Password checked with bcrypt
5. ✅ Response returns user object
6. ✅ User stored in localStorage
7. ✅ Page redirects to dashboard

### User Clicks Sign Up
1. ✅ Form validates all fields
2. ✅ Checks email/username uniqueness
3. ✅ Backend inserts user
4. ✅ Password hashed with bcrypt
5. ✅ Credentials inserted
6. ✅ Response returns user object
7. ✅ User stored in localStorage
8. ✅ Page redirects to dashboard

### User Enters Wrong Password
1. ✅ Backend queries user OK
2. ❌ bcrypt.compare() returns false
3. ❌ Response: { success: false, message: "Invalid credentials" }
4. ❌ Browser shows error
5. ❌ No redirect

### User Email Already Exists
1. ✅ Signup form submitted
2. ✅ Backend counts users with that email
3. ❌ Count > 0
4. ❌ Response: { success: false, message: "Email already registered" }
5. ❌ Browser shows error
6. ❌ No new user created

---

**Now you understand the complete system!** 🎉

Ready to test? Follow ACTION_PLAN.md and start with `npm start`.
