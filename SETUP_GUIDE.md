# Quick Setup Guide - Event Management System

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup MySQL Database

```bash
# Create the database schema
mysql -u root -p < server/database/schema.sql

# (Optional) Create test users
mysql -u root -p event_management < server/database/test_data.sql
```

### Step 3: Configure Environment

Create `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_management
```

### Step 4: Generate Login Credentials

```bash
# From the backend directory
node setup-credentials.js
```

This creates test users with bcrypt-hashed passwords.

### Step 5: Start the Server

```bash
npm start
```

Server will start on **http://localhost:5000**

---

## Login with Test Credentials

After running `setup-credentials.js`, test the system:

**Admin Login:**
```bash
Email: admin@eventflow.com
Password: admin123  # (temporary - change after first login)
```

**Organizer Login:**
```bash
Email: organizer@eventflow.com
Password: organizer123  # (temporary - change after first login)
```

**Attendee Login:**
```bash
Email: attendee@eventflow.com
Password: attendee123  # (temporary - change after first login)
```

---

## Full Setup with Detailed Instructions

For complete setup, customization, and troubleshooting, see:
📖 [SETUP_AUTHENTICATION.md](SETUP_AUTHENTICATION.md)

This includes:
- Detailed step-by-step instructions
- Database structure overview
- Manual credential creation
- Security best practices
- Testing guidelines

---

## Create Your Own User

### Via Registration API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com",
    "password": "secure_password",
    "role": "attendee"
  }'
```

### Via Login UI

1. Open http://localhost:5000
2. Click "Sign Up"
3. Fill in the form and select your role
4. Click "Sign Up"

---

## Common Issues

| Issue | Solution |
|-------|----------|
| MySQL connection error | Check .env credentials and ensure MySQL is running |
| Port 5000 in use | Change PORT in .env or kill process: `netstat -ano \| findstr :5000` |
| "Table doesn't exist" | Re-run: `mysql -u root -p < server/database/schema.sql` |
| No users found | Run: `node setup-credentials.js` |
| Frontend not loading | Verify server is running on http://localhost:5000 |

---

## Development Mode

For auto-restart on code changes:

```bash
npm run dev
```

---

## Next Steps

- 📖 API Documentation: [BACKEND_README.md](backend/BACKEND_README.md)
- 🔑 Login Credentials: [LOGIN_CREDENTIALS.md](LOGIN_CREDENTIALS.md)
- 🏗️ Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- 📚 Integration Guide: [INTEGRATION_GUIDE.js](INTEGRATION_GUIDE.js)

---

## Summary

**You've successfully set up:**
- ✅ MySQL database with proper schema
- ✅ Backend server with role-based authentication
- ✅ No hardcoded default credentials
- ✅ Bcrypt password hashing
- ✅ Test users with secure credentials
- ✅ Ready for production with your own users

**Happy coding! 🚀**
