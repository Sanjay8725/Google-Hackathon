# EventFlow - Login Credentials Setup

## No Default Credentials

By design, **no default login credentials exist** in this system. You must:
1. Set up the database schema
2. Create test users (optional)
3. Generate credentials with hashed passwords

## Setup Instructions

### Step 1: Create Database Schema

```bash
# From the backend directory
mysql -u root -p < server/database/schema.sql
```

### Step 2: Create Test Users (Optional)

```bash
# From the backend directory
mysql -u root -p event_management < server/database/test_data.sql
```

### Step 3: Generate Login Credentials

```bash
# From the backend directory
node setup-credentials.js
```

This will create test credentials with the following usernames and emails:
- **Admin**: @admin / admin@eventflow.com
- **Organizer**: @organizer / organizer@eventflow.com  
- **Attendee**: @attendee / attendee@eventflow.com

The script will display the temporary passwords in the console.

### Step 4: Change Passwords

After first login, users must change their passwords immediately. The initial passwords are **temporary only**.

---

## Manual User Registration

### Via API - Signup Endpoint

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "username": "yourusername",
  "email": "your@email.com",
  "password": "secure_password",
  "role": "attendee"  // or "organizer", "admin"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Your Name",
    "username": "yourusername",
    "email": "your@email.com",
    "role": "attendee"
  }
}
```

---

## How Authentication Works

1. **Database Storage**: 
   - Users table stores: name, username, email, role
   - Role-specific credential tables store password hashes:
     - `admin_credentials` - for admin users
     - `organizer_credentials` - for organizer users
     - `attendee_credentials` - for attendee users

2. **Password Security**: Passwords are hashed using bcrypt with salt rounds = 10

3. **Dual Login**: Login with either:
   - **Username**: @username (e.g., @admin)
   - **Email**: email@domain.com (e.g., admin@eventflow.com)

4. **Role-Based Login**: Use role-specific endpoints for authentication

---

## Login Endpoints

### Admin Login
Login with **Username** or **Email**:

```bash
# Option 1: Login with Username
POST http://localhost:5000/api/auth/login/admin
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "admin123"
}
```

```bash
# Option 2: Login with Email
POST http://localhost:5000/api/auth/login/admin
Content-Type: application/json

{
  "usernameOrEmail": "admin@eventflow.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@eventflow.com",
    "role": "admin"
  }
}
```

### Organizer Login
```bash
POST http://localhost:5000/api/auth/login/organizer
Content-Type: application/json

{
  "usernameOrEmail": "organizer",  // or "organizer@eventflow.com"
  "password": "organizer123"
}
```

### Attendee Login
```bash
POST http://localhost:5000/api/auth/login/attendee
Content-Type: application/json

{
  "usernameOrEmail": "attendee",  // or "attendee@eventflow.com"
  "password": "attendee123"
}
```

---

## Get User Profile

```bash
GET http://localhost:5000/api/auth/profile/:userId
```

Example:
```bash
GET http://localhost:5000/api/auth/profile/1
```

Response:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@eventflow.com",
    "role": "admin",
    "created_at": "2026-02-22T10:30:00.000Z"
  }
}
```

---

## Security Best Practices

- ⚠️ **Never share credentials** with anyone
- 🔒 **Always use HTTPS** in production
- 🔑 **Change passwords regularly**
- 🚫 **Don't use test credentials in production**
- 📝 **Audit login attempts** in logs
- ✅ **Enable two-factor authentication** when available

---

## Error Responses

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Missing Fields
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

### Email Already Registered
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Database Error
```json
{
  "success": false,
  "message": "Database unavailable"
}
```
