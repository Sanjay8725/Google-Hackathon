# ✅ Quick Action Checklist - Fix Login & Signup

## Phase 0: Pre-Flight Checks (Do First!)

- [ ] **Verify Backend is Running**
  ```bash
  cd backend
  npm start
  ```
  You should see: `Server running on port 5000`

- [ ] **Verify Database is Running**
  ```bash
  mysql --version
  # and check MySQL service is running
  ```

- [ ] **Verify Frontend is Served**
  ```
  Open: http://localhost:5000/test-auth.html
  # OR if using separate frontend server
  Open: http://localhost:3000/test-auth.html
  ```

---

## Phase 1: Diagnose Backend State (5 minutes)

### Step 1.1: Run Diagnostic Tool
```bash
cd backend
node diagnose.js
```

**What to look for:**
- ✅ All checks pass: Database looks good, proceed to Phase 2
- ❌ "Database connection failed": MySQL not running
  - FIX: Start MySQL service
- ❌ User table missing: Schema not loaded
  - FIX: Run `mysql -u root -p < backend/server/database/schema.sql`
- ❌ No test users found
  - FIX: Run `node setup-credentials.js`

**If everything passes, continue to Phase 2**

---

## Phase 2: Test API Endpoints (5 minutes)

### Option A: Use Test Page (Easier)
1. Open browser: `http://localhost:5000/test-auth.html`
2. Click buttons in this order:
   - [ ] "Test Server Connection" → Should show ✅ Server is running!
   - [ ] "Check Database Users" → Should show diagnostic hint
   - [ ] "Test Login" (with defaults admin/admin123) → Should show success with user object
   - [ ] "Test Signup" (with new values) → Should show success status 201

### Option B: Use cURL (Terminal)
```bash
# Test 1: Health check
curl http://localhost:5000/api/health

# Test 2: Login (should return user object with role)
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}'

# Test 3: Signup (should return HTTP 201 - Created)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test999","email":"test999@ex.com","password":"test123","role":"attendee"}'
```

**All 3 tests should show success. If not:**
- Note the error message
- Go to Phase 3 with the specific error

---

## Phase 3: Test Frontend (10 minutes)

### Step 3.1: Test Login Page
1. Open: `http://localhost:5000/auth.html` (or http://localhost:3000/auth.html)
2. **Open F12 Developer Console** (Press F12 or Right-click → Inspect → Console tab)
3. Click role: **Admin** 🛡️
4. Enter:
   - Username: `admin`
   - Password: `admin123`
5. Click **Login**

### Step 3.2: Read Console Logs (CRITICAL!)
**You should see these logs in order:**
```
🔐 Attempting login with: { usernameOrEmail: "admin", role: "admin" }
✅ Login response: { success: true, user: { id: 1, ... } }
📦 User object: { id: 1, ... }
🎯 User role: admin
➡️ Redirecting to admin dashboard
```

### Step 3.3: Check Results

**✅ ALL LOGS APPEAR + PAGE NAVIGATES → LOGIN IS WORKING!**

**❌ LOGS MISSING or ERROR?**
- "No 🔐 log" → Form not calling handleAuth()
  - FIX: Clear browser cache (Ctrl+Shift+Delete), refresh page
- "❌ Auth failed" log → Backend returned error
  - ACTION: Note the exact error message
  - FIX: Verify credentials exist: `node setup-credentials.js`
- "➡️ Redirecting..." but no page change → Dashboard page not found
  - FIX: Check if `/admin/admin.html` exists: `ls frontend/src/public/admin/`

---

## Phase 4: Test Signup Page

### Step 4.1: Test Signup
1. On same page, click "Sign up" link at bottom
2. **Keep F12 Console open**
3. Fill form:
   - Full Name: `NewUser123`
   - Username: `newuser123`
   - Email: `newuser123@example.com`
   - Password: `newuser123`
4. Select role: **Attendee** 👤
5. Click **Create Account**

### Step 4.2: Read Console Logs
**You should see:**
```
📝 Attempting signup with: { name: "NewUser123", username: "newuser123", ... }
✅ Signup response: { success: true, message: "User registered successfully", ... }
```

### Step 4.3: Check Results

**✅ LOGS + PAGE NAVIGATES → SIGNUP IS WORKING!**

**❌ ERROR MESSAGES:**
- "Email already registered" → Use different email
- "Username already taken" → Use different username
- "Network error" → Backend not running

---

## Phase 5: Verify in Database

After successful signup, verify the new user exists:
```bash
mysql -u root -p event_management

# Check users table
SELECT id, name, username, email, role FROM users WHERE username = 'newuser123';

# Should show:
# id | name       | username     | email                      | role
# 10 | NewUser123 | newuser123   | newuser123@example.com     | attendee
```

---

## 🆘 If Something Fails

### Symptom: "Network error - Failed to fetch"
**Cause:** Backend not running or CORS issue
**Fix:**
```bash
# Check if running
ps aux | grep node

# Kill if stuck
pkill -f "node server.js"

# Restart
cd backend
npm start
```

### Symptom: "Invalid credentials"
**Cause:** User doesn't exist or password wrong
**Fix:**
```bash
cd backend
node diagnose.js
# Check if users exist

# Or regenerate credentials
node setup-credentials.js
```

### Symptom: "Database unavailable"
**Cause:** MySQL not running or connection failed
**Fix:**
```bash
# Check MySQL
mysql --version
# Start MySQL service

# Verify connection
mysql -u root -p -e "SELECT 1"
```

### Symptom: "Email already registered" on every signup
**Cause:** Email already in database from previous tests
**Fix:**
```bash
mysql -u root -p event_management
DELETE FROM users WHERE email = 'test@example.com';
```

### Symptom: Login works but page shows blank/errors
**Cause:** Dashboard JavaScript has errors
**Fix:**
1. After login redirects, press F12
2. Check Console tab for JavaScript errors
3. Share the error of with me

---

## 📋 Report Template

If you're still stuck, provide this info:

```
1. Backend Status:
   - Running: YES / NO
   - Port: 5000 / OTHER / UNKNOWN

2. Database Status:
   - MySQL running: YES / NO
   - Diagnose.js result: [PASS / FAIL - paste error]

3. API Endpoints:
   - Health check works: YES / NO
   - Login test result: [SUCCESS / FAILURE - paste response]
   - Signup test result: [SUCCESS / FAILURE - paste response]

4. Frontend Login Test:
   - Console logs appear: YES / NO
   - Error message: [if any]
   - Page navigates: YES / NO / UNKNOWN

5. Dashboard Pages:
   - /admin/admin.html exists: YES / NO / UNKNOWN
   - Page shows when navigated: YES / NO / ERROR

6. Console Errors:
   [Paste any red errors from F12 console]
```

---

## ✅ Success Criteria

You'll know everything is working when:
1. ✅ Test page shows "Server is running"
2. ✅ Login page appears
3. ✅ You can login with admin/admin123
4. ✅ Console shows "Redirecting to admin dashboard"
5. ✅ Page navigates to dashboard
6. ✅ You can create new account (signup)
7. ✅ New user appears in database

🎉 **Mission Accomplished!**

---

## Quick Commands Reference

```bash
# Start backend
cd backend && npm start

# Check database
mysql -u root -p < backend/server/database/schema.sql

# Add test data
mysql -u root -p event_management < backend/server/database/test_data.sql

# Setup credentials
cd backend && node setup-credentials.js

# Run diagnostics
cd backend && node diagnose.js

# Check if port 5000 is in use
netstat -an | grep 5000

# View recent logs
tail -f backend/server/logs.txt (if available)
```

---

## Next: What You Should Do NOW

1. **Right now:**
   - [ ] Verify backend is running: `npm start`
   - [ ] Open test page: `http://localhost:5000/test-auth.html`
   - [ ] Click "Test Server Connection"

2. **If that works:**
   - [ ] Click "Test Login"
   - [ ] Copy the result, send to me

3. **If that fails:**
   - [ ] Run `cd backend && node diagnose.js`
   - [ ] Copy the output, send to me

**I'm ready to help! Just run these commands and share the output.** 👍
