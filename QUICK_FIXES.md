# 🔧 Quick Fixes - Copy & Paste Solutions

## Fix 1: Backend Not Starting

**Problem:** `npm start` doesn't work or port already in use

**Solution:**
```bash
# Kill any node process on port 5000
netstat -an | grep 5000

# Copy the PID from output, then:
taskkill /PID <PID> /F

# Or just kill all node:
taskkill /F /IM node.exe

# Then try again:
cd backend
npm start
```

---

## Fix 2: Database Connection Error

**Problem:** "Database unavailable" error

**Solution:**
```bash
# 1. Verify MySQL is installed
mysql --version

# 2. Start MySQL service (if not running)
# On Windows:
#   - Services → MySQL → Start
# On Mac:
#   - brew services start mysql
# On Linux:
#   - sudo service mysql start

# 3. Test connection
mysql -u root -p

# 4. If password forgotten, reset it (Windows):
mysqld --skip-grant-tables
# Then in new terminal:
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
```

---

## Fix 3: "Invalid credentials" - User Doesn't Exist

**Problem:** Login fails even with correct username

**Solution:**
```bash
# 1. Setup test users
cd backend
node setup-credentials.js

# 2. Verify in database
mysql -u root -p event_management
SELECT username, email FROM users;

# 3. Create test user manually if needed
INSERT INTO users (name, username, email, role) 
VALUES ('Test Admin', 'admin', 'admin@admin.com', 'admin');

# Get the user ID
SELECT LAST_INSERT_ID();

# Insert credentials (replace USER_ID with actual ID)
INSERT INTO admin_credentials (user_id, password_hash) 
VALUES (USER_ID, '$2b$10$...');  # Use bcrypt hash from setup

# Easier: Just run setup again
node setup-credentials.js
```

---

## Fix 4: Form Not Submitting (No Console Logs)

**Problem:** Click "Login" but nothing happens, no console logs

**Solution:**
```bash
# 1. Clear browser cache
# Developer Tools → Application → Clear site data
# OR: Ctrl + Shift + Delete

# 2. Refresh page
Ctrl + F5 (hard refresh)

# 3. Check if scripts loaded
# F12 → Network tab → Look for:
#   - api.js (should show size > 1KB)
#   - auth.js (should show size > 1KB)

# 4. Check for JavaScript errors
# F12 → Console → Look for red errors

# 5. Manually test form is wired
# F12 → Console → Type:
window.handleAuth
# Should show: ƒ handleAuth(event) { ...

# If undefined, scripts didn't load
# Check browser console for loader errors
```

---

## Fix 5: Login Works but No Page Redirect

**Problem:** "Redirecting..." log but page doesn't navigate

**Solution:**
```bash
# 1. Check if dashboard page exists
ls frontend/src/public/admin/
# Should show: admin.html

ls frontend/src/public/organizer/
# Should show: organizer-dashboard.html

ls frontend/src/public/attendee/
# Should show: attendee-dashboard.html

# 2. If missing, check for typos in filenames
ls -la frontend/src/public/

# 3. Verify server is serving frontend
# Check server.js for:
app.use(express.static(
  path.join(__dirname, '../public')
));

# 4. Test direct navigation
# Open browser: http://localhost:5000/admin/admin.html
# Should show page, not 404

# If 404:
#   - Path is wrong in server.js
#   - Files aren't in frontend/src/public/
```

---

## Fix 6: Signup Not Creating Account

**Problem:** "Creating account..." but user not in database

**Solution:**
```bash
# 1. Check form validation
# F12 → Console → Look for:
# "Please enter name and username"
# If yes, fill ALL fields on signup

# 2. Check for database constraint violations
# Common: Email or username already exists
# F12 → Console → Look for error message

# 3. Check server is receiving data
# F12 → Network tab → Find POST to /api/auth/register
# Click it → Preview tab → See server response

# 4. If no error shown but not created:
# Check backend console for logs
# Backend terminal should show:
# "Register error: [error details]"

# 5. Verify database tables exist
mysql -u root -p event_management
SHOW TABLES;
# Should show: users, admin_credentials, organizer_credentials, etc.

# 6. Check user insertion works
INSERT INTO users (name, username, email, role)
VALUES ('Test', 'testuser999', 'test999@ex.com', 'attendee');
SELECT LAST_INSERT_ID();

# Should return user ID, if error, note the error
```

---

## Fix 7: "Email already registered" Every Time

**Problem:** Can't create new accounts because email/username already used

**Solution:**
```bash
# 1. Clean up old test records
mysql -u root -p event_management

# Delete all test users
DELETE FROM users WHERE username LIKE 'test%';
DELETE FROM users WHERE email LIKE 'test%';
DELETE FROM users WHERE email LIKE 'newuser%';

# 2. Verify deletion
SELECT id, username, email FROM users;

# 3. Try signup again with same email

# 4. Or just use different email each time
# Instead of: test@example.com
# Use: test1@ex.com, test2@ex.com, etc. (add number)
```

---

## Fix 8: Blank Page After Login

**Problem:** Navigates to dashboard but shows blank page

**Solution:**
```bash
# 1. Check for JavaScript errors
# F12 → Console → Look for red errors
# Copy error and search solution

# Common errors:
# "Cannot read property 'user' of undefined"
#   → User object not in localStorage

# "$ is not defined"
#   → jQuery not loaded (if page uses jQuery)

# 2. Check localStorage has user
# F12 → Application → LocalStorage → eventflow
# Should show: user key with value

# 3. Check dashboard page loads
# F12 → Network → Look for 404s
# If dashboard.html shows 404:
#   - File doesn't exist
#   - Path wrong
#   - Server not serving correctly

# 4. Check HTML file syntax
cat frontend/src/public/admin/admin.html | head -20
# Should show valid HTML

# 5. Try opening dashboard directly
# http://localhost:5000/admin/admin.html
# If blank here too, issue is in HTML/CSS/JS
```

---

## Fix 9: Database Not Connecting

**Problem:** "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Solution:**
```bash
# 1. Verify MySQL credentials in .env
cat backend/.env
# Check: DB_HOST, DB_USER, DB_PASS

# 2. Test connection manually
mysql -h 127.0.0.1 -u root -p

# 3. If wrong password:
mysql -u root -p
# Try default: root or blank password

# 4. Update .env if needed
nano backend/.env
# Change DB_PASS to correct password
# Save and restart backend: npm start

# 5. Check MySQL port (usually 3306)
netstat -an | grep 3306
# Should show LISTENING

# 6. If not running, start MySQL service
# Windows: Services → MySQL → Start
```

---

## Fix 10: Tests Pass But Login Still Fails

**Problem:** test-auth.html login works but real auth.html doesn't

**Solution:**
```bash
# 1. Check both pages use same API base URL
# test-auth.html:
grep "API_BASE_URL" frontend/src/public/test-auth.html

# auth.html (loaded from api.js):
grep "API_BASE_URL" frontend/src/js/api.js

# Both should use: http://localhost:5000/api (or same URL)

# 2. Check CORS is configured
# In server.js, should have:
app.use(cors());
# OR
app.use(cors({ origin: 'http://localhost:3000' }));

# 3. Check if running on different port
# If frontend on :3000 and backend on :5000
# CORS might block it
# Solution: Use express.static from backend for frontend
# OR: Add proper CORS headers

# 4. Compare test-auth.html and auth.html
# Look for differences in how they call API
# Use same code style

# 5. Check browser security
# Some browsers block cross-origin by default
# Try in Chrome Incognito
# Or disable CORS: Chrome with --disable-web-security
```

---

## Super Quick Version (If Short on Time)

```bash
# Full reset - do these in order:

# 1. Kill backend
taskkill /F /IM node.exe

# 2. Reset database
mysql -u root -p event_management < backend/server/database/schema.sql
mysql -u root -p event_management < backend/server/database/test_data.sql

# 3. Setup credentials
cd backend
node setup-credentials.js

# 4. Start backend
npm start

# 5. Open browser
# http://localhost:5000/test-auth.html
# Click "Test Server Connection"
# If success, try login

# If still fails, open F12 console and tell me the error
```

---

## Emergency Debug (If totally stuck)

```bash
# 1. Enable verbose logging
# Edit backend/server/controllers/authController.js
# Change console.error to console.log for ALL errors
# Restart backend

# 2. Watch backend terminal for logs
# Make a login attempt
# Note exact error logged

# 3. Check browser console F12
# Copy any red errors

# 4. Check MySQL logs
# Look in MySQL data directory for error logs

# Send output of all 3 to me
```

---

## Contact Checklist Before Asking for Help

Make sure you've:
- [ ] Run diagnose.js
- [ ] Tried test-auth.html
- [ ] Checked F12 developer console
- [ ] Attempted one of the fixes above
- [ ] Verified backend is running
- [ ] Verified MySQL is running
- [ ] Verified database schema is loaded

**Then share:**
- [ ] The exact error message (screenshot or copy-paste)
- [ ] Server logs (from npm start terminal)
- [ ] Browser console logs (F12)
- [ ] Output of diagnose.js
- [ ] Output of: `ls frontend/src/public/*/`

Good luck! 🚀
