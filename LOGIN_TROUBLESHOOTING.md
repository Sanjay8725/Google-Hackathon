# Login Issues - Troubleshooting Guide

## Issue Summary
Username and password are correct but cannot login to dashboard for admin, organizer, or attendee.

---

## Diagnostic Steps

### Step 1: Check Browser Console for Errors

1. Open browser **Developer Tools** (F12)
2. Go to **Console** tab
3. Try to login
4. Look for:
   - `🔐 Attempting login with:` - Should show username/email and role
   - `✅ Login response:` - Should show the API response
   - `📦 User object:` - Should show user data with role
   - `➡️ Redirecting to...` - Should show which dashboard to redirect to
   - Any red error messages

**Share these console logs** if login is failing!

---

### Step 2: Verify Database Users Exist

Run this MySQL command:

```sql
mysql -u root -p event_management -e "SELECT id, name, username, email, role FROM users;"
```

Expected output:
```
+----+------------------+-----+------------------------+----------+
| id | name             | username    | email                  | role     |
+----+------------------+-----+------------------------+----------+
|  1 | Admin User       | admin       | admin@eventflow.com    | admin    |
|  2 | Organizer User   | organizer   | organizer@eventflow.com| organizer|
|  3 | Alice Attendee   | attendee    | attendee@eventflow.com | attendee |
+----+------------------+-----+------------------------+----------+
```

If you don't see users with `username` field, run:
```bash
cd backend
node setup-credentials.js
```

---

### Step 3: Verify Credentials Table

Check if passwords are stored:

```sql
mysql -u root -p event_management -e "SELECT user_id, password_hash FROM admin_credentials; SELECT user_id, password_hash FROM organizer_credentials; SELECT user_id, password_hash FROM attendee_credentials;"
```

Each user should have a password hash (long string starting with `$2b$`).

---

### Step 4: Manual API Test

Test the login endpoint directly:

#### Test Login with Username (Admin):
```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "admin", "password": "admin123"}'
```

#### Expected Response:
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

#### If you get "Invalid credentials":
- Username/email or password is wrong
- User not in database
- Credentials not created properly

---

### Step 5: Test Login with Email

```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "admin@eventflow.com", "password": "admin123"}'
```

Should return the same successful response.

---

### Step 6: Test for Each Role

#### Organizer:
```bash
curl -X POST http://localhost:5000/api/auth/login/organizer \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "organizer", "password": "organizer123"}'
```

#### Attendee:
```bash
curl -X POST http://localhost:5000/api/auth/login/attendee \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "attendee", "password": "attendee123"}'
```

---

## Common Issues & Fixes

### Issue 1: "Invalid credentials" on correct password

**Cause:** User not found in database or credentials not set up

**Fix:**
```bash
# 1. Check if users exist
mysql -u root -p event_management -e "SELECT * FROM users;"

# 2. If not, create test data
mysql -u root -p event_management < backend/server/database/test_data.sql

# 3. Generate credentials
cd backend
node setup-credentials.js
```

---

### Issue 2: Login API works but page doesn't redirect

**Cause:** JavaScript error or dashboard file missing

**Fix:**
1. Check browser console (F12) for errors
2. Check if admin.html exists:
   ```bash
   ls frontend/src/public/admin/admin.html
   ls frontend/src/public/organizer/organizer-dashboard.html
   ls frontend/src/public/attendee/attendee-dashboard.html
   ```

---

### Issue 3: Role is wrong or not returned

**Cause:** Database user has wrong role value

**Fix:**
```bash
# Check role values in database
mysql -u root -p event_management -e "SELECT id, email, role FROM users;"

# Update if needed
mysql -u root -p event_management -e "UPDATE users SET role = 'admin' WHERE username = 'admin';"
```

---

### Issue 4: Column 'username' doesn't exist

**Cause:** Schema not updated

**Fix:**
```bash
# Backup current data (optional)
mysqldump -u root -p event_management > backup.sql

# Recreate database with new schema
mysql -u root -p < backend/server/database/schema.sql

# Restore data if needed
mysql -u root -p event_management < backend/server/database/test_data.sql

# Generate credentials
cd backend
node setup-credentials.js
```

---

## Complete Fresh Setup

If the above steps don't work, do a complete fresh setup:

```bash
# 1. Delete old database (if exists)
mysql -u root -p -e "DROP DATABASE IF EXISTS event_management;"

# 2. Create fresh schema
mysql -u root -p < backend/server/database/schema.sql

# 3. Add test data
mysql -u root -p event_management < backend/server/database/test_data.sql

# 4. Generate credentials
cd backend
node setup-credentials.js

# 5. Start server
npm start
```

---

## Server Logs to Check

In terminal where server is running, you should see:
```
✅ MySQL Database connected successfully
```

If you see database connection errors, fix `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_management
```

---

## Browser Console Tests

Open browser console (F12) and test:

```javascript
// Test 1: Check if API is available
console.log(window.api);
// Should show an object with login, register, etc.

// Test 2: Check localStorage
console.log(localStorage.getItem('selectedRole'));
// Should show 'admin', 'organizer', or 'attendee'

// Test 3: Try login manually
await window.api.login({
  usernameOrEmail: 'admin',
  password: 'admin123',
  role: 'admin'
});
// Should return successful response
```

---

## What Each Console Log Means

| Log | Meaning |
|-----|---------|
| `🔐 Attempting login with:` | Login started |
| `✅ Login response:` | API responded |
| `📦 User object:` | User data received |
| `🎯 User role: admin` | Role correctly identified |
| `➡️ Redirecting to admin/admin.html` | Should redirect now |

If any of these are missing, that's where the issue is.

---

## Still Having Issues?

Share the following information:

1. **Browser console output** - Paste all console logs (F12 → Console)
2. **Database query results**:
   ```bash
   mysql -u root -p event_management -e "SELECT * FROM users;"
   ```
3. **Curl test output** - Result of the manual API test
4. **Server logs** - Any errors in the terminal where server is running

---

## Quick Fix Command

Run this to quickly fix most issues:

```bash
cd backend
mysql -u root -p event_management < server/database/schema.sql
mysql -u root -p event_management < server/database/test_data.sql
node setup-credentials.js
npm start
```

Then try login in browser:
- **Username**: admin
- **Password**: admin123
- **Role**: Admin (select before login)

---

**Your feedback will help identify the exact issue!**
