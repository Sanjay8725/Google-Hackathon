# 🚀 Quick Reference - Testing Guide

## Starting the Application

### 1. Start the Backend Server
```bash
cd "d:\My Projects\google hackathon"
npm run server
```

**Expected Output:**
```
Server running on port 5001
Frontend available at http://localhost:5001
API available at http://localhost:5001/api
⚠️  MySQL connection warning: API will work with mock data
```

### 2. Access the Application
```
URL: http://localhost:5001
Expected: Home page with "Get Started" button
```

---

## 🔐 Test Credentials

### Pre-registered Users (Built-in)
```
┌─ ADMIN
│  Email: admin@eventflow.com
│  Password: admin123
│  Username: admin
│
├─ ORGANIZER
│  Email: organizer@eventflow.com
│  Password: organizer123
│  Username: organizer
│
└─ ATTENDEE
   Email: attendee@eventflow.com
   Password: attendee123
   Username: attendee
```

---

## 📝 Test Scenarios

### Scenario 1: Login as Admin
```
1. Navigate to http://localhost:5001
2. Click "Get Started"
3. On auth page, select "🛡️ Admin" role
4. Click "Login" tab (if on signup)
5. Enter: admin@eventflow.com
6. Enter: admin123
7. Click "Login"

Expected Result:
✅ Redirects to http://localhost:5001/admin/admin.html
✅ Dashboard shows admin statistics
✅ localStorage contains: {"id":1,"role":"admin",...}
```

### Scenario 2: Login as Organizer
```
1. Navigate to http://localhost:5001/public/auth.html
2. Select "🎯 Organizer" role
3. Enter: organizer@eventflow.com
4. Enter: organizer123
5. Click "Login"

Expected Result:
✅ Redirects to http://localhost:5001/organizer/organizer-dashboard.html
✅ Dashboard shows organizer events & stats
✅ localStorage contains role: "organizer"
```

### Scenario 3: Login as Attendee
```
1. Navigate to http://localhost:5001/public/auth.html
2. Select "👤 Attendee" role
3. Enter: attendee@eventflow.com
4. Enter: attendee123
5. Click "Login"

Expected Result:
✅ Redirects to http://localhost:5001/attendee/attendee-dashboard.html
✅ Dashboard shows schedule, QR pass, feedback, certificates
✅ localStorage contains role: "attendee"
```

### Scenario 4: Signup as New User
```
1. Navigate to http://localhost:5001/public/auth.html
2. Click "Sign Up" tab
3. Enter Name: John Doe
4. Enter Username: johndoe
5. Enter Email: john@example.com
6. Enter Password: mypassword123
7. Select Role: "👤 Attendee"
8. Click "Create Account"

Expected Result:
✅ User created successfully
✅ Redirects to attendee dashboard
✅ localStorage contains new user data
```

### Scenario 5: Test Invalid Credentials
```
1. Navigate to http://localhost:5001/public/auth.html
2. Select any role
3. Enter: wrong@email.com
4. Enter: wrongpassword
5. Click "Login"

Expected Result:
⚠️ Error message: "Invalid credentials"
❌ No redirect occurs
❌ localStorage not updated
```

---

## 🔧 API Testing

### Test Login Endpoint
```bash
curl -X POST http://localhost:5001/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin@eventflow.com","password":"admin123"}'

# Expected Response (200 OK):
{
  "success": true,
  "message": "Login successful (mock data)",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@eventflow.com",
    "username": "admin",
    "role": "admin"
  }
}
```

### Test Signup Endpoint
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "username":"testuser",
    "email":"test@example.com",
    "password":"password123",
    "role":"attendee"
  }'

# Expected Response (201 Created):
{
  "success": true,
  "message": "User registered successfully (mock data)",
  "user": {
    "id": 8,
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "role": "attendee"
  }
}
```

### Test Health Check
```bash
curl http://localhost:5001/api/health

# Expected Response (200 OK):
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🌐 Page Access URLs

| Page | URL | Role Required | Status |
|------|-----|---------------| -------|
| Home | http://localhost:5001 | None | ✅ Public |
| Auth | http://localhost:5001/public/auth.html | None | ✅ Public |
| Admin | http://localhost:5001/admin/admin.html | Admin | ✅ Checks role |
| Organizer | http://localhost:5001/organizer/organizer-dashboard.html | Organizer | ✅ Checks role |
| Attendee | http://localhost:5001/attendee/attendee-dashboard.html | Attendee | ✅ Checks role |

---

## 🐛 Debugging Checklist

### Browser Console Checks
```javascript
// Check if user is stored
localStorage.getItem('user')
// Expected: {"id":1,"name":"Admin User",...}

// Check if API is accessible
fetch('http://localhost:5001/api/health').then(r => r.json())
// Expected: {status: "ok"}

// Check current page
window.location.href
// Expected: /admin/admin.html or /organizer/... or /attendee/...

// Check if API module loaded
window.api
// Expected: {login: f, register: f, ...}
```

### Common Issues & Fixes

#### Issue 1: "Cannot GET /admin/admin.html"
**Cause:** Server not running or wrong port  
**Fix:** Start server with `npm run server`

#### Issue 2: "API port mismatch"
**Cause:** API calls still using port 5000  
**Fix:** Check `api.js` line 2: `const API_BASE_URL = 'http://localhost:5001/api';`

#### Issue 3: "User redirects to auth page instead of dashboard"
**Cause:** localStorage not storing user or role check failing  
**Fix:** Open console and check: `localStorage.getItem('user')`

#### Issue 4: "CSS not loading"
**Cause:** Wrong relative path  
**Fix:** Check HTML link tags use `../../styles/` for module pages

#### Issue 5: "Login works but no redirect"
**Cause:** Role mismatch or localStorage issue  
**Fix:** Check console for errors, verify user.role in response

---

## ✅ Connection Verification Steps

### Step 1: Verify Server Running
```bash
# Server should respond
Invoke-WebRequest http://localhost:5001/api/health -UseBasicParsing

# Expected: StatusCode 200
```

### Step 2: Verify Home Page
```bash
# Should load successfully
Invoke-WebRequest http://localhost:5001 -UseBasicParsing

# Should contain "EventFlow"
```

### Step 3: Verify Auth Page
```bash
# Should load successfully
Invoke-WebRequest http://localhost:5001/public/auth.html -UseBasicParsing

# Should contain form elements
```

### Step 4: Verify Login Works
```bash
# Admin login should succeed
POST /api/auth/login/admin with credentials

# Expected: 200 OK with user object
```

### Step 5: Verify Dashboard Pages
```bash
# All three dashboard pages should load
GET /admin/admin.html → 200 OK
GET /organizer/organizer-dashboard.html → 200 OK
GET /attendee/attendee-dashboard.html → 200 OK
```

---

## 📊 System Status

### Current Configuration
```
Environment: Development
Server Port: 5001
API Base URL: http://localhost:5001/api
Database: MySQL (Unavailable - Using Mock Data)
Demo Mode: Enabled
CORS: Enabled
Mock Users: 3 pre-loaded + dynamic creation
```

### Available Tests
- ✅ Login (all 3 roles)
- ✅ Signup (all 3 roles)
- ✅ Role-based redirects
- ✅ CSS/JS loading
- ✅ API connectivity
- ✅ localStorage persistence
- ✅ Error handling

---

## 🔄 Complete Test Flow

```
1. Start Server
   npm run server

2. Open Browser
   http://localhost:5001

3. Test Home Page
   Click "Get Started" → Auth page loads

4. Test Login
   - Select role
   - Enter credentials
   - Click Login
   → Dashboard loads

5. Test Signup
   - Click "Sign Up"
   - Enter new credentials
   - Click "Create"
   → New user dashboard

6. Test Role Redirects
   - Admin → /admin/admin.html
   - Organizer → /organizer/organizer-dashboard.html
   - Attendee → /attendee/attendee-dashboard.html

7. Check Browser Console
   - No 404 errors
   - No CORS errors
   - localStorage contains user
   - API calls successful

RESULT: ✅ ALL SYSTEMS OPERATIONAL
```

---

## 📱 Testing on Mobile (Optional)

### Access from another device:
```
1. Find your computer's IP:
   ipconfig /all
   (Look for IPv4 Address)

2. On mobile browser:
   http://<YOUR_IP>:5001

3. Test login/signup as normal
```

---

## 🎯 Success Criteria

All of the following should be working:

- [ ] Server starts without errors
- [ ] Home page loads with "Get Started" button
- [ ] Auth page loads with login form
- [ ] Admin can login with credentials
- [ ] Admin redirects to admin dashboard
- [ ] Organizer can login with credentials
- [ ] Organizer redirects to organizer dashboard
- [ ] Attendee can login with credentials
- [ ] Attendee redirects to attendee dashboard
- [ ] User data stored in localStorage
- [ ] CSS files load and apply styling
- [ ] JS files load and execute
- [ ] API calls respond with 200/201 status
- [ ] Signup works for new users
- [ ] New users can login after signup
- [ ] No console errors

**When all criteria met: ✅ READY FOR DEPLOYMENT**

---

## 🔗 File References

- Backend Entry: [backend/server/server.js](backend/server/server.js)
- Auth Controller: [backend/server/controllers/authController.js](backend/server/controllers/authController.js)
- API Client: [frontend/src/js/api.js](frontend/src/js/api.js)
- Auth JS: [frontend/src/js/auth.js](frontend/src/js/auth.js)
- Admin Dashboard: [frontend/src/public/admin/admin.html](frontend/src/public/admin/admin.html)
- Organizer Dashboard: [frontend/src/public/organizer/organizer-dashboard.html](frontend/src/public/organizer/organizer-dashboard.html)
- Attendee Dashboard: [frontend/src/public/attendee/attendee-dashboard.html](frontend/src/public/attendee/attendee-dashboard.html)

---

## 📞 Support

If you encounter any issues:

1. **Check Server Status**
   ```bash
   # Should report running on port 5001
   ```

2. **Check Console**
   - Open browser F12 (DevTools)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Check Logs**
   - Server console shows request logs
   - Check for database connection errors

4. **Restart Server**
   ```bash
   # Kill current process and restart
   npm run server
   ```

---

**Last Updated:** February 22, 2026  
**Status:** ✅ Ready for Testing
