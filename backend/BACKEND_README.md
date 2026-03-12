# Event Management Backend API

Complete Node.js/Express backend with MySQL database integration.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database

#### Create MySQL Database
```bash
mysql -u root -p
```

Then run the schema:
```sql
source server/database/schema.sql
```

Or use MySQL Workbench to execute [server/database/schema.sql](server/database/schema.sql)

#### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_management
PORT=5000
```

### 3. Start the Server
```bash
npm run server
```

Server will run on `http://localhost:5000`
Frontend served from `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:id` - Get user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/organizer/:organizerId` - Get organizer's events
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/:id/registrations` - Get event registrations

### Attendance
- `POST /api/attendance/checkin` - QR check-in
- `GET /api/attendance/event/:eventId` - Get event attendance
- `GET /api/attendance/user/:userId` - Get user attendance history
- `POST /api/attendance/qr-scan` - Simulate QR scan

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/event/:eventId` - Get event feedback
- `GET /api/feedback/stats/:eventId` - Get feedback statistics

### Analytics
- `GET /api/analytics/event/:eventId` - Get comprehensive event analytics
- `GET /api/analytics/dashboard/:organizerId` - Get organizer dashboard stats
- `POST /api/analytics/track` - Track engagement action

## Database Schema

### Tables
- **users** - User accounts (organizers & attendees)
- **events** - Event details and statistics
- **registrations** - Event registrations with QR codes
- **attendance** - Check-in records
- **feedback** - Event ratings and comments
- **analytics** - Custom metrics tracking
- **engagement_logs** - User engagement actions

## Frontend Integration

The frontend JavaScript in [src/js/app.js](src/js/app.js) now makes API calls to the backend instead of using local state.

### API Helper Functions
```javascript
// Example: Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Example: Get events
const response = await fetch('http://localhost:5000/api/events');
const data = await response.json();
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: bcrypt for password hashing
- **Middleware**: CORS, body-parser
- **Environment**: dotenv

## Project Structure
```
├── server/
│   ├── server.js                 # Main server file
│   ├── config/
│   │   └── database.js           # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── eventController.js    # Event CRUD
│   │   ├── attendanceController.js
│   │   ├── feedbackController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── analyticsRoutes.js
│   └── database/
│       └── schema.sql             # Database schema
├── src/
│   ├── js/
│   │   └── app.js                # Frontend with API integration
│   └── styles/
└── index.html
```

## Development

### Run in Development Mode
```bash
npm run dev
```

### Test API Endpoints
Use Postman, Insomnia, or curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"organizer"}'
```

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- SQL injection prevented with parameterized queries
- CORS enabled for frontend access
- Environment variables for sensitive data
- Input validation on all endpoints

## Future Enhancements

- JWT token authentication
- WebSocket for real-time updates
- File upload for event images
- Email notifications
- Payment gateway integration
- Rate limiting
- API documentation with Swagger
