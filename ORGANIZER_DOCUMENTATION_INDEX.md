# Organizer Portal - API & Integration Documentation

## 📑 Complete Documentation Suite

Welcome! This is your one-stop guide for implementing the Organizer Portal API. Start here to find the right documentation for your role.

---

## 🎯 Quick Start by Role

### 👨‍💼 Project Manager / Tech Lead
**Start with**: [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

This document provides:
- 7-day implementation timeline
- Phase breakdown with time estimates
- Task distribution guide
- Progress tracking
- Key milestones and checkpoints

**Read time**: 15-20 minutes

---

### 👨‍💻 Backend Developer
**Start with**: [BACKEND_API_IMPLEMENTATION_GUIDE.md](BACKEND_API_IMPLEMENTATION_GUIDE.md)

This document provides:
- Complete controller implementations
- Database queries ready to copy-paste
- Route setup instructions
- Error handling patterns
- Testing guidelines

**Key sections**:
1. Event Controller - Handle all event CRUD operations
2. Attendance Controller - Manage registrations and check-ins
3. Expense Controller - Track event expenses
4. Vendor Controller - Manage event vendors
5. Analytics Controller - Calculate metrics
6. Organizer Controller - User profiles

**Read time**: 30-40 minutes

---

### 👨‍💻 Frontend Developer
**Start with**: [ORGANIZER_FORM_INTEGRATION_GUIDE.md](ORGANIZER_FORM_INTEGRATION_GUIDE.md)

This document provides:
- Complete form handlers with HTML examples
- JavaScript fetch implementations
- Common utility functions
- Validation patterns
- Testing examples

**Key sections**:
1. Event Form - Create and manage events
2. Registration Form - Register attendees
3. Expense Form - Track expenses
4. Vendor Form - Manage vendors
5. Analytics Dashboard - Display metrics
6. Settings Form - Update profile

**Read time**: 25-35 minutes

---

### 🧪 QA/Tester
**Start with**: [ORGANIZER_API_DOCUMENTATION.md](ORGANIZER_API_DOCUMENTATION.md)

This document provides:
- API endpoint specifications
- Request/response examples for each endpoint
- Error scenarios and responses
- Validation rules
- CURL command examples for testing

**Key sections**:
1. 11 API endpoints with full specifications
2. Request body examples
3. Response formats
4. Error handling documentation
5. Rate limiting info
6. Authentication details

**Read time**: 20-30 minutes

---

### 📊 Database Administrator
**Start with**: [DATABASE_FORM_MAPPING.md](DATABASE_FORM_MAPPING.md)

This document provides:
- Form fields mapped to database tables
- SQL INSERT/UPDATE queries
- Data relationships
- Required indexes
- Validation requirements

**Read time**: 15 minutes

---

## 📚 Documentation Files

### 1. IMPLEMENTATION_ROADMAP.md
**Purpose**: Complete project timeline and task breakdown

**Contains**:
- 7-day phase breakdown
- Time estimates for each task
- Step-by-step implementation guide
- Progress tracking template
- Common troubleshooting
- Deployment checklist

**Best for**: Planning, project management, understanding project scope

**Read when**: Planning sprint, assigning tasks, tracking progress

---

### 2. BACKEND_API_IMPLEMENTATION_GUIDE.md
**Purpose**: Backend controller implementations

**Contains**:
- 7 complete controller implementations
- Ready-to-copy code
- Database queries
- Validation middleware
- Error handling
- Route configuration

**Controllers Included**:
1. **eventController.js** - Create, read, update, delete events
2. **attendanceController.js** - Register attendees, check-ins
3. **expenseController.js** - Track and manage expenses
4. **vendorController.js** - Vendor management
5. **analyticsController.js** - Dashboard and event analytics
6. **organizerController.js** - Organizer profiles
7. **All route files** - Express routes configuration

**Best for**: Implementing backend functionality

**Copy code from**: Each controller section

---

### 3. ORGANIZER_FORM_INTEGRATION_GUIDE.md
**Purpose**: Frontend form submission and API integration

**Contains**:
- 7 complete form handlers
- HTML form examples
- JavaScript fetch implementations
- Common utility functions
- Form validation examples
- Error handling patterns

**Forms Included**:
1. **Create Event** - Event management form
2. **Register Attendee** - Attendee registration
3. **Event List** - Load and display events
4. **Add Expense** - Expense tracking
5. **Add Vendor** - Vendor management
6. **Analytics** - Load and display metrics
7. **Settings** - Organizer profile update

**Best for**: Frontend implementation, integrating forms with API

**Files to update**:
- `frontend/src/js/organizer/organizer.js`
- `frontend/src/js/organizer/expense.js`
- `frontend/src/js/organizer/vendors.js`
- `frontend/src/js/organizer/analytics.js`
- `frontend/src/js/organizer/settings.js`

---

### 4. ORGANIZER_API_DOCUMENTATION.md
**Purpose**: Complete API reference and testing guide

**Contains**:
- 11 API endpoint specifications
- Request and response examples
- All error codes explained
- Data validation rules
- Authentication requirements
- CURL test commands

**API Endpoints**:
1. **Event Management** - 5 endpoints (POST, GET, PUT, DELETE)
2. **Registrations** - 3 endpoints (POST register, GET list, POST check-in)
3. **Expenses** - 4 endpoints (POST, GET, PUT, DELETE)
4. **Vendors** - 4 endpoints (POST, GET, PUT, DELETE)
5. **Analytics** - 3 endpoints (dashboard, event, engagement)
6. **Settings** - 2 endpoints (GET, PUT profile)

**Best for**: Testing API, writing API documentation, understanding endpoint behavior

**Test using**: Postman, curl, or browser console

---

### 5. DATABASE_FORM_MAPPING.md
**Purpose**: Map form fields to database tables and queries

**Contains**:
- Form field to table column mapping
- SQL INSERT queries ready to copy
- SQL UPDATE queries ready to copy
- Data relationships
- Validation requirements
- Index recommendations

**Mapped Forms**:
1. **Create Event** → events table
2. **Register Attendee** → registrations table
3. **Add Expense** → event_expenses table
4. **Add Vendor** → event_vendors table
5. **Organizer Settings** → organizer_profiles table

**Best for**: Database design, understanding data flow, creating queries

**Reference tables**:
- events
- registrations
- event_expenses
- event_vendors
- organizer_profiles
- Plus 15+ other supporting tables

---

## 🔄 Implementation Workflow

### Step 1: Understand the Architecture
1. Read: IMPLEMENTATION_ROADMAP.md (Phase overview)
2. Read: DATABASE_FORM_MAPPING.md (Data relationships)
3. Reference: ORGANIZER_API_DOCUMENTATION.md (API structure)

### Step 2: Implement Backend
1. Read: BACKEND_API_IMPLEMENTATION_GUIDE.md
2. Copy controller code for each module
3. Set up routes
4. Test with CURL commands

### Step 3: Test Backend
1. Use CURL commands from ORGANIZER_API_DOCUMENTATION.md
2. Verify response formats
3. Check error handling
4. Test authorization

### Step 4: Implement Frontend
1. Read: ORGANIZER_FORM_INTEGRATION_GUIDE.md
2. Copy form handlers to JavaScript files
3. Update HTML forms if needed
4. Test form submissions

### Step 5: Integration Testing
1. Fill frontend form
2. Click submit
3. Verify API call in Network tab
4. Check database for new record
5. Verify response displayed in UI

### Step 6: Launch
1. Final code review
2. Performance testing
3. Security audit
4. Deploy to production

---

## 📊 Quick Reference Tables

### API Endpoints at a Glance

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/events` | Create event | Yes |
| GET | `/api/events` | List events | Yes |
| GET | `/api/events/:id` | Event details | Yes |
| PUT | `/api/events/:id` | Update event | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes |
| POST | `/api/events/:id/register` | Register attendee | Yes |
| GET | `/api/events/:id/registrations` | List registrations | Yes |
| POST | `/api/events/:id/checkin` | Check-in attendee | Yes |
| POST | `/api/events/:id/expenses` | Add expense | Yes |
| GET | `/api/events/:id/expenses` | List expenses | Yes |
| PUT | `/api/expenses/:id` | Update expense | Yes |
| DELETE | `/api/expenses/:id` | Delete expense | Yes |
| POST | `/api/events/:id/vendors` | Add vendor | Yes |
| GET | `/api/events/:id/vendors` | List vendors | Yes |
| PUT | `/api/vendors/:id` | Update vendor | Yes |
| DELETE | `/api/vendors/:id` | Delete vendor | Yes |
| GET | `/api/analytics/dashboard` | Dashboard metrics | Yes |
| GET | `/api/events/:id/analytics` | Event analytics | Yes |
| GET | `/api/events/:id/engagement` | Engagement metrics | Yes |
| GET | `/api/organizers/profile` | Get profile | Yes |
| PUT | `/api/organizers/profile` | Update profile | Yes |

### Form Fields by Type

| Form | Fields | Database Table | File |
|------|--------|----------------|------|
| Create Event | title, description, date, time, location, category, type, capacity | events | organizer-dashboard.html |
| Register Attendee | email, event, ticket_type | registrations | organizer-dashboard.html |
| Add Expense | title, category, amount, date, method, notes | event_expenses | expense.html |
| Add Vendor | name, contact, email, phone, category, location, fee, notes | event_vendors | vendors.html |
| Settings | org_name, website, phone, address, tax_id, bank_account | organizer_profiles | settings.html |

### Database Tables Reference

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| events | Event information | id, organizer_id, title, date, status |
| registrations | Attendee registrations | id, event_id, user_id, ticket_type |
| event_expenses | Expense tracking | id, event_id, title, amount, category |
| event_vendors | Vendor management | id, event_id, vendor_name, booth_fee |
| organizer_profiles | Organizer information | organizer_id, organization_name, contact_phone |

---

## 🧪 Testing Guide

### Unit Testing (Backend)
- Test each controller function
- Test validation logic
- Test error responses
- Use BACKEND_API_IMPLEMENTATION_GUIDE.md examples

### Integration Testing
- Connect frontend to backend
- Test full workflows
- Verify database updates
- Check error handling

### End-to-End Testing
- Test complete user flows
- Verify UI updates
- Check all pages work
- Test on multiple browsers

### Test Data
```sql
-- Create test event
INSERT INTO events (organizer_id, title, date, location, category)
VALUES (1, 'Test Event', '2026-04-15', 'Test Location', 'Business');

-- Register test attendee
INSERT INTO registrations (event_id, user_id, ticket_type)
VALUES (1, 2, 'General');

-- Add test expense
INSERT INTO event_expenses (event_id, title, amount, category)
VALUES (1, 'Test Expense', 100.00, 'Other');
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot POST /api/events"
**Solution**: Check route is registered in server.js
```javascript
app.use('/api/events', eventRoutes);
```

### Issue: "401 Unauthorized"
**Solution**: Check token is in Authorization header
```javascript
// Correct format
Authorization: Bearer eyJhbGc...
```

### Issue: Form won't submit
**Solution**: Check form ID matches handler
```html
<form id="createEventForm"> <!-- Must match -->
```

### Issue: Data not showing after submit
**Solution**: Check event list is refreshed after submit
```javascript
// After successful submit, refresh list
if (typeof loadEvents === 'function') {
  loadEvents();
}
```

### Issue: 404 Not Found
**Solution**: Check endpoint URL and method
```bash
# Check URL format
http://localhost:3000/api/events ✓
http://localhost:3000/api/event ✗ (wrong endpoint)
```

---

## 📞 Getting Help

### For Backend Questions
- See: BACKEND_API_IMPLEMENTATION_GUIDE.md
- Reference: Database queries section
- Check: Error handling examples

### For Frontend Questions
- See: ORGANIZER_FORM_INTEGRATION_GUIDE.md
- Copy: Form handler code
- Check: Common utilities section

### For API Questions
- See: ORGANIZER_API_DOCUMENTATION.md
- Try: CURL command examples
- Check: Error responses table

### For Database Questions
- See: DATABASE_FORM_MAPPING.md
- Reference: SQL queries
- Check: Table relationships

---

## 📈 Implementation Checklist

### Phase 1: Backend (Days 1-2)
- [ ] Database configuration updated
- [ ] Event controller implemented
- [ ] Attendance controller updated
- [ ] Expense controller created
- [ ] Vendor controller created
- [ ] Analytics controller updated
- [ ] Organizer controller created
- [ ] All routes configured
- [ ] Basic testing complete

### Phase 2: Testing (Day 2)
- [ ] All endpoints tested with CURL
- [ ] Error handling verified
- [ ] Authorization checks working
- [ ] Load testing passed

### Phase 3: Frontend (Days 3-4)
- [ ] Event form integrated
- [ ] Registration handler added
- [ ] Expense form integrated
- [ ] Vendor form integrated
- [ ] Analytics dashboard working
- [ ] Settings form working
- [ ] Common utilities created
- [ ] All forms tested

### Phase 4: Analytics (Day 4)
- [ ] Dashboard analytics implemented
- [ ] Event analytics working
- [ ] Engagement metrics calculated
- [ ] Analytics UI complete

### Phase 5: Security (Day 5)
- [ ] Authorization checks added
- [ ] Input validation complete
- [ ] Rate limiting implemented
- [ ] Security testing passed

### Phase 6: QA (Day 6)
- [ ] Unit tests written
- [ ] Integration tests passed
- [ ] E2E tests passed
- [ ] Performance acceptable

### Phase 7: Deployment (Day 7)
- [ ] Production setup complete
- [ ] Database migrated
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Monitoring active

---

## 📚 Additional Resources

### External Documentation
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### Related Files in Repository
- `backend/server/database/schema.sql` - Complete database schema
- `backend/server/controllers/` - Existing controllers
- `frontend/src/js/` - Frontend JavaScript
- `frontend/src/public/organizer/` - Organizer portal HTML

---

## 📄 Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| IMPLEMENTATION_ROADMAP.md | 1.0 | 2026-03-13 | Ready |
| BACKEND_API_IMPLEMENTATION_GUIDE.md | 1.0 | 2026-03-13 | Ready |
| ORGANIZER_FORM_INTEGRATION_GUIDE.md | 1.0 | 2026-03-13 | Ready |
| ORGANIZER_API_DOCUMENTATION.md | 1.0 | 2026-03-13 | Ready |
| DATABASE_FORM_MAPPING.md | 1.0 | 2026-03-13 | Ready |
| INDEX.md | 1.0 | 2026-03-13 | Ready |

---

## 🎯 Next Steps

1. **Choose your role** from "Quick Start by Role" section
2. **Read the appropriate document** for 20-40 minutes
3. **Start implementing** following the step-by-step guides
4. **Reference other documents** as needed
5. **Test thoroughly** using provided test commands
6. **Deploy confidently** following deployment checklist

---

## ✅ Success Criteria

Your implementation will be successful when:
- ✅ All API endpoints working correctly
- ✅ All frontend forms submitting data
- ✅ Data persisting in database
- ✅ Analytics showing correct calculations
- ✅ Error handling working for all scenarios
- ✅ Authorization preventing unauthorized access
- ✅ Performance acceptable (< 500ms per request)
- ✅ All tests passing

---

## 🚀 Ready to Start?

Pick your role above and jump to the corresponding document. Happy coding!

**Questions?** Check the troubleshooting section in IMPLEMENTATION_ROADMAP.md

---

