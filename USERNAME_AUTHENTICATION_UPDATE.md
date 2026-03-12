# Authentication System Update - Username & Name Fields

## Summary of Changes

Your authentication system has been updated to:
- ✅ Add username/email combined login field
- ✅ Add name and username fields to signup form
- ✅ Support dual login (username OR email)
- ✅ Database schema updated with username field

---

## Frontend Changes

### 1. Login Page (auth.html)
**Added:**
- Name field (visible only during signup)
- Username field (visible only during signup)
- Email label changes to "Username or Email" during login

**Fields by Mode:**
- **Login**: Username or Email + Password
- **Signup**: Full Name + Username + Email + Password

### 2. JavaScript Logic (auth.js)
**Updated:**
- Handles name and username inputs
- Shows/hides fields based on login/signup mode
- Sends `usernameOrEmail` to login API
- Sends `name`, `username`, `email` to register API
- Updated label text dynamically

---

## Backend Changes

### 1. Database Schema (schema.sql)
**Added:**
```sql
username VARCHAR(100) UNIQUE
```
- Added to users table
- Indexed for fast lookups
- Support for dual login capability

### 2. Register API (authController.js)
**Now Accepts:**
```javascript
{
  name: "Your Name",
  username: "yourusername",
  email: "your@email.com",
  password: "your_password",
  role: "attendee"
}
```

**Validation:**
- Checks email uniqueness
- Checks username uniqueness
- Returns error if either exists

### 3. Login API (authController.js)
**Now Accepts:**
```javascript
{
  usernameOrEmail: "admin",  // can be @username or email@domain.com
  password: "your_password",
  role: "admin"
}
```

**Smart Detection:**
- If contains `@` → treat as email
- If no `@` → treat as username
- Checks appropriate field in database

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@eventflow.com",
    "role": "admin"
  }
}
```

### 4. Test Credentials (setup-credentials.js)
**Updated Test Users:**
```
ADMIN:
  Username: @admin
  Email: admin@eventflow.com
  Password: admin123

ORGANIZER:
  Username: @organizer
  Email: organizer@eventflow.com
  Password: organizer123

ATTENDEE:
  Username: @attendee
  Email: attendee@eventflow.com
  Password: attendee123
```

---

## Usage Examples

### Login with Username
```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "admin123"
  }'
```

### Login with Email
```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin@eventflow.com",
    "password": "admin123"
  }'
```

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "attendee"
  }'
```

---

## Database Updates

To apply the schema changes:

```bash
# 1. Drop and recreate the database with new schema
mysql -u root -p < backend/server/database/schema.sql

# 2. Add test users
mysql -u root -p event_management < backend/server/database/test_data.sql

# 3. Generate credentials with usernames
cd backend
node setup-credentials.js
```

---

## UI Flow

### Login Form
```
┌─────────────────────────────────┐
│  🎯 EventFlow                   │
│  [Login]  [Sign Up]             │
│                                 │
│  I am a: [Admin] [Organizer] [Attendee]
│                                 │
│  Username or Email: [________] │
│  Password:          [________] │
│                                 │
│  [Login]                        │
└─────────────────────────────────┘
```

### Signup Form
```
┌─────────────────────────────────┐
│  🎯 EventFlow                   │
│  [Login]  [Sign Up]             │
│                                 │
│  I am a: [Admin] [Organizer] [Attendee]
│                                 │
│  Full Name: [________________] │
│  Username:  [________________] │
│  Email:     [________________] │
│  Password:  [________________] │
│                                 │
│  [Create Account]               │
└─────────────────────────────────┘
```

---

## Error Handling

### Signup Errors
- "Please enter name and username." - Missing required fields
- "Email already registered" - Email exists
- "Username already taken" - Username exists

### Login Errors
- "Please enter email/username and password." - Missing fields
- "Invalid credentials" - Wrong username/email or password
- "Please select a role." - No role selected

---

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/public/auth.html` | Added name & username fields |
| `frontend/src/js/auth.js` | Updated form logic for new fields |
| `backend/server/database/schema.sql` | Added username column & index |
| `backend/server/controllers/authController.js` | Updated register & login functions |
| `backend/setup-credentials.js` | Updated test credentials with usernames |
| `backend/server/database/test_data.sql` | Added usernames to test data |
| `LOGIN_CREDENTIALS.md` | Updated API documentation |

---

## Testing

### Step 1: Setup Fresh Database
```bash
mysql -u root -p < backend/server/database/schema.sql
mysql -u root -p event_management < backend/server/database/test_data.sql
cd backend && node setup-credentials.js
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Test Login
- On login form, enter: `admin` (as username) or `admin@eventflow.com` (as email)
- Password: `admin123`
- Should successfully login

### Step 4: Test Signup
- Select role
- Enter full name, username, email, password
- Click "Create Account"
- Should be redirected to dashboard

---

## Security Notes

✅ Usernames are unique in database  
✅ Passwords are bcrypt hashed  
✅ Both username and email are indexed  
✅ Dual login doesn't increase attack surface  
✅ Invalid credentials message remains generic  

---

## What Users Can Now Do

1. **Login with Username**: Faster, shorter, easier to remember
2. **Login with Email**: Standard email-based authentication
3. **Signup with Username**: Choose custom usernames
4. **Unique Identification**: Usernames + emails both unique

---

**Ready to test!** 🚀
