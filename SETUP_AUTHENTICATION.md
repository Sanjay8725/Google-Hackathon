# Complete Setup Guide - Authentication & Database

## Overview

This guide walks you through setting up a clean authentication system without any default credentials.

---

## Prerequisites

- Node.js 14+ installed
- MySQL 8.0+ running
- Environment variables configured (.env file)

### .env Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=event_management

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Setup Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Database Schema

Setup the MySQL database with the proper schema:

```bash
mysql -u root -p < server/database/schema.sql
```

This creates:
- `event_management` database
- `users` table
- Role-based credential tables:
  - `admin_credentials`
  - `organizer_credentials`
  - `attendee_credentials`
- Event-related tables (events, registrations, attendance, feedback, analytics, etc.)

### Step 3: (Optional) Create Test Users

Populate the database with test user records:

```bash
mysql -u root -p event_management < server/database/test_data.sql
```

This inserts test users **without any passwords**. You'll set passwords in the next step.

### Step 4: Generate Credentials

Run the credentials setup script to create password hashes:

```bash
# From the backend directory
node setup-credentials.js
```

Output example:
```
🔐 Setting up credentials...

✅ Created user: Admin User (admin@eventflow.com) - ID: 1
   ✏️  Created password for admin: admin@eventflow.com
   📝 Temporary password: admin123
   ⚠️  IMPORTANT: Change this password after first login!

✅ Created user: Organizer User (organizer@eventflow.com) - ID: 2
   ✏️  Created password for organizer: organizer@eventflow.com
   📝 Temporary password: organizer123
   ⚠️  IMPORTANT: Change this password after first login!

✅ Created user: Alice Attendee (attendee@eventflow.com) - ID: 3
   ✏️  Created password for attendee: attendee@eventflow.com
   📝 Temporary password: attendee123
   ⚠️  IMPORTANT: Change this password after first login!

✨ Credentials setup complete!

📋 Test Login Credentials:
══════════════════════════════════════════════════════

ADMIN:
  Email: admin@eventflow.com
  Password: admin123

ORGANIZER:
  Email: organizer@eventflow.com
  Password: organizer123

ATTENDEE:
  Email: attendee@eventflow.com
  Password: attendee123

══════════════════════════════════════════════════════

⚠️  SECURITY WARNING:
  - These are TEMPORARY credentials for testing only
  - Change all passwords immediately after first login
  - Never use these credentials in production
  - Update users to change their passwords regularly
```

### Step 5: Start the Server

```bash
npm start
```

The server will start on `http://localhost:5000`

---

## Creating Additional Users

### Method 1: Via Registration API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "secure_password_123",
    "role": "attendee"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 8,
    "name": "New User",
    "email": "newuser@example.com",
    "role": "attendee"
  }
}
```

### Method 2: Manual Database Insert + Script

1. Insert user record:
```sql
INSERT INTO users (name, email, role) VALUES ('New User', 'newuser@example.com', 'organizer');
```

2. Run setup script to generate credentials:
```bash
node setup-credentials.js
```

---

## Login Process

### Test Login via API

#### Admin Login:
```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventflow.com",
    "password": "admin123"
  }'
```

#### Organizer Login:
```bash
curl -X POST http://localhost:5000/api/auth/login/organizer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@eventflow.com",
    "password": "organizer123"
  }'
```

#### Attendee Login:
```bash
curl -X POST http://localhost:5000/api/auth/login/attendee \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attendee@eventflow.com",
    "password": "attendee123"
  }'
```

---

## Customizing Credentials

To use different temporary credentials:

1. Edit `backend/setup-credentials.js`
2. Modify the `TEST_CREDENTIALS` array:

```javascript
const TEST_CREDENTIALS = [
  {
    email: 'your-admin@email.com',
    password: 'your-secure-password',
    role: 'admin',
    name: 'Your Admin Name'
  },
  // ... more users
];
```

3. Run the script again:
```bash
node setup-credentials.js
```

---

## Testing the Complete Flow

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Attendee",
    "email": "test@example.com",
    "password": "test12345",
    "role": "attendee"
  }'
```

### 2. Login with the New User
```bash
curl -X POST http://localhost:5000/api/auth/login/attendee \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test12345"
  }'
```

### 3. Get User Profile
```bash
curl http://localhost:5000/api/auth/profile/YOUR_USER_ID
```

---

## Database Structure

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'organizer', 'attendee') DEFAULT 'attendee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Admin Credentials Table
```sql
CREATE TABLE admin_credentials (
  user_id INT PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Similar tables exist for:
- `organizer_credentials`
- `attendee_credentials`

---

## Security Checklist

- [ ] Database schema created
- [ ] No default credentials in code
- [ ] Passwords hashed with bcrypt (10 salt rounds)
- [ ] .env file configured with strong DB password
- [ ] Test credentials changed after first login
- [ ] HTTPS configured in production
- [ ] Role-based access control implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] Authentication token system ready

---

## Troubleshooting

### MySQL Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check .env database credentials
- Ensure database exists: `node setup-credentials.js`

### No Users Found
- Run test data script: `mysql -u root -p event_management < server/database/test_data.sql`
- Then generate credentials: `node setup-credentials.js`

### Invalid Credentials Error
- Verify user exists: `SELECT * FROM users WHERE email = 'your-email';`
- Check credentials table: `SELECT * FROM admin_credentials;`
- Re-generate credentials if needed

### Password Hash Issues
- Ensure bcrypt is installed: `npm install bcrypt`
- Clear and recreate credentials: `node setup-credentials.js`

---

## File Structure

```
backend/
├── setup-credentials.js          # Generate password hashes
├── server/
│   ├── server.js               # Express server
│   ├── config/
│   │   └── database.js         # Database connection
│   ├── controllers/
│   │   └── authController.js   # Auth logic (register, login)
│   ├── routes/
│   │   └── authRoutes.js       # Auth endpoints
│   └── database/
│       ├── schema.sql          # Database schema
│       └── test_data.sql       # Test users
```

---

## Next Steps

1. ✅ Setup complete!
2. 📝 Create your first account via registration endpoint
3. 🔐 Test login with credentials
4. 🚀 Deploy with your own database credentials
5. 👥 Invite users to register

