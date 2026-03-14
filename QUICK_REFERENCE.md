# 🚀 Organizer Portal API - Quick Reference Card

**Print this or keep it in your browser bookmarks!**

---

## 📚 All Documentation at a Glance

```
START HERE → ORGANIZER_DOCUMENTATION_INDEX.md

├─ Roadmap → IMPLEMENTATION_ROADMAP.md (Planning)
├─ Backend → BACKEND_API_IMPLEMENTATION_GUIDE.md (Coding)
├─ Frontend → ORGANIZER_FORM_INTEGRATION_GUIDE.md (Forms)
├─ API Ref → ORGANIZER_API_DOCUMENTATION.md (Testing)
└─ Database → DATABASE_FORM_MAPPING.md (Queries)
```

---

## 🎯 Quick Start by Role (Pick One)

### 👨‍💼 PM / Tech Lead
→ Read **IMPLEMENTATION_ROADMAP.md**  
⏱️ 20 minutes  
📊 Use for: planning, timeline, progress tracking

### 👨‍💻 Backend Dev
→ Read **BACKEND_API_IMPLEMENTATION_GUIDE.md**  
⏱️ 40 minutes  
💾 Copy controllers, set up routes, test with curl

### 👨‍💻 Frontend Dev
→ Read **ORGANIZER_FORM_INTEGRATION_GUIDE.md**  
⏱️ 35 minutes  
🔌 Copy form handlers, integrate with HTML

### 🧪 QA/Tester
→ Read **ORGANIZER_API_DOCUMENTATION.md**  
⏱️ 30 minutes  
🔬 Use curl commands, test all endpoints

### 📊 DBA
→ Read **DATABASE_FORM_MAPPING.md**  
⏱️ 15 minutes  
🗄️ Review queries, create indexes

---

## 📊 API Endpoints Quick Reference

### Create Event
```bash
POST /api/events
Body: {title, description, date, start_time, location, category, venue_type, capacity}
Success: 201 {eventId, event}
```

### List Events
```bash
GET /api/events
Success: 200 {events, total, page, limit}
```

### Add Expense
```bash
POST /api/events/:eventId/expenses
Body: {title, category, amount, expense_date, payment_method, notes}
Success: 201 {expenseId, expense}
```

### Add Vendor
```bash
POST /api/events/:eventId/vendors
Body: {vendor_name, vendor_email, vendor_phone, vendor_category, booth_fee, ...}
Success: 201 {vendorId, vendor}
```

### Get Analytics
```bash
GET /api/events/:eventId/analytics
Success: 200 {analytics: {total_registrations, check_ins, revenue, profit, ...}}
```

### Update Profile
```bash
PUT /api/organizers/profile
Body: {organization_name, contact_phone, website, office_address, ...}
Success: 200 {message}
```

---

## 🛠️ Backend Setup Checklist

```
□ 1. Add query helper to database.js
□ 2. Create eventController.js (copy from guide)
□ 3. Update attendanceController.js
□ 4. Create expenseController.js
□ 5. Create vendorController.js
□ 6. Update analyticsController.js
□ 7. Create organizerController.js
□ 8. Create all route files
□ 9. Update server.js with routes
□ 10. Test with curl commands
```

**Estimated Time**: 4-8 hours

---

## 💻 Frontend Setup Checklist

```
□ 1. organizer.js - Add event form handler
□ 2. organizer.js - Add registration handler
□ 3. organizer.js - Add loadEvents function
□ 4. expense.js - Add expense form handler
□ 5. expense.js - Add loadExpenses function
□ 6. vendors.js - Add vendor form handler
□ 7. vendors.js - Add loadVendors function
□ 8. analytics.js - Add loadAnalytics function
□ 9. settings.js - Add settings handler & loader
□ 10. Test all forms end-to-end
```

**Estimated Time**: 6-10 hours

---

## 🗄️ Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-----------|
| events | Event info | id, organizer_id, title, date, status |
| registrations | Attendees | id, event_id, user_id, ticket_type |
| event_expenses | Expenses | id, event_id, title, amount, category |
| event_vendors | Vendors | id, event_id, vendor_name, booth_fee |
| organizer_profiles | Profile | organizer_id, organization_name, phone |

---

## 🧪 Testing with CURL

### Test Create Event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "date": "2026-04-15",
    "location": "Test Location",
    "category": "Business",
    "venue_type": "in-person"
  }'
```

### Test Get Events
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Add Expense
```bash
curl -X POST http://localhost:3000/api/events/45/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Catering",
    "amount": 1500.00,
    "category": "Food",
    "expense_date": "2026-03-13"
  }'
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check Authorization header has bearer token |
| 404 Not Found | Verify endpoint path and HTTP method |
| 403 Forbidden | Check event ownership & authorization |
| Empty response | Check browser console for errors |
| Data not saved | Verify database connection & fields |
| CORS error | Enable CORS middleware in server.js |

---

## 📋 Form Fields Reference

### Create Event Form
```
- newEventTitle (required, 5+ chars)
- newEventDescription (required, 10+ chars)
- newEventDate (required, future date)
- newEventTime (required)
- newEventLocation (required, 5+ chars)
- newEventCategory (required)
- newEventMode (required: in-person/virtual/hybrid)
- newEventCapacity (required, positive integer)
```

### Add Expense Form
```
- expenseTitle (required, 3+ chars)
- expenseCategory (required)
- expenseAmount (required, positive decimal)
- expenseDate (required, current or past)
- expensePaymentMethod (required)
- expenseNotes (optional)
```

### Add Vendor Form
```
- vendorName (required, 3+ chars)
- vendorContact (required)
- vendorEmail (required, valid email)
- vendorPhone (required, valid phone)
- vendorCategory (required)
- boothLocation (optional)
- boothFee (optional, positive decimal)
- vendorNotes (optional)
```

---

## 🔑 Key Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/events | Create event | ✅ |
| GET | /api/events | List events | ✅ |
| GET | /api/events/:id | Get event details | ✅ |
| PUT | /api/events/:id | Update event | ✅ |
| DELETE | /api/events/:id | Delete event | ✅ |
| POST | /api/events/:id/expenses | Add expense | ✅ |
| GET | /api/events/:id/expenses | List expenses | ✅ |
| PUT | /api/expenses/:id | Update expense | ✅ |
| DELETE | /api/expenses/:id | Delete expense | ✅ |
| POST | /api/events/:id/vendors | Add vendor | ✅ |
| GET | /api/events/:id/vendors | List vendors | ✅ |
| PUT | /api/vendors/:id | Update vendor | ✅ |
| DELETE | /api/vendors/:id | Delete vendor | ✅ |
| POST | /api/events/:id/register | Register attendee | ✅ |
| GET | /api/events/:id/registrations | List registrations | ✅ |
| POST | /api/events/:id/checkin | Check-in attendee | ✅ |
| GET | /api/analytics/dashboard | Dashboard metrics | ✅ |
| GET | /api/events/:id/analytics | Event analytics | ✅ |
| GET | /api/events/:id/engagement | Engagement metrics | ✅ |
| GET | /api/organizers/profile | Get profile | ✅ |
| PUT | /api/organizers/profile | Update profile | ✅ |

**Total: 21 Endpoints**

---

## 📁 Files to Create/Update

### Backend Files
```
backend/server/controllers/
  ├─ eventController.js (NEW - copy from guide)
  ├─ attendanceController.js (UPDATE add 3 functions)
  ├─ expenseController.js (NEW - copy from guide)
  ├─ vendorController.js (NEW - copy from guide)
  ├─ analyticsController.js (UPDATE add 3 functions)
  └─ organizerController.js (NEW - copy from guide)

backend/server/routes/
  ├─ eventRoutes.js (UPDATE)
  ├─ attendanceRoutes.js (UPDATE)
  ├─ expenseRoutes.js (NEW)
  ├─ vendorRoutes.js (NEW)
  ├─ analyticsRoutes.js (UPDATE)
  └─ organizerRoutes.js (NEW)

backend/server/
  ├─ server.js (UPDATE routes)
  └─ config/database.js (UPDATE add query helper)
```

### Frontend Files
```
frontend/src/js/organizer/
  ├─ organizer.js (ADD event/registration handlers)
  ├─ expense.js (ADD expense handlers)
  ├─ vendors.js (ADD vendor handlers)
  ├─ analytics.js (ADD analytics loader)
  └─ settings.js (ADD settings handlers)
```

---

## ⚙️ Technology Stack

### Backend
- Node.js + Express.js
- MySQL (Database)
- express-validator (Validation)

### Frontend
- HTML5
- JavaScript (ES6+)
- Fetch API
- CSS3

### Testing
- curl or Postman
- Node.js test frameworks

---

## 📈 Success Criteria

- ✅ All 21 API endpoints working
- ✅ All 7 forms submitting successfully
- ✅ Data persists in database
- ✅ Error handling for all scenarios (400, 401, 403, 404, 500)
- ✅ Authorization preventing unauthorized access
- ✅ Response time < 500ms
- ✅ All tests passing

---

## 🎓 Time Estimates

| Task | Time | Difficulty |
|------|------|-----------|
| Backend Setup | 4-8 hours | Medium |
| Backend Testing | 2-4 hours | Easy |
| Frontend Integration | 6-10 hours | Medium |
| Analytics | 3-5 hours | Medium |
| Security & Optimization | 4-6 hours | Hard |
| QA Testing | 5-8 hours | Easy |
| Deployment | 2-4 hours | Hard |
| **TOTAL** | **26-45 hours** | ⏱️ About 1 week |

---

## 🎯 Implementation Sequence

1. **Day 1**: Backend setup (all controllers)
2. **Day 2**: Backend testing & fix issues
3. **Day 3-4**: Frontend form integration
4. **Day 4-5**: Analytics & testing
5. **Day 6**: Security & optimization
6. **Day 7**: Final QA & deployment

---

## 📞 Where to Find Help

| Question | Document |
|----------|----------|
| "How do I set up backend?" | BACKEND_API_IMPLEMENTATION_GUIDE.md |
| "How do I integrate forms?" | ORGANIZER_FORM_INTEGRATION_GUIDE.md |
| "What's the API spec?" | ORGANIZER_API_DOCUMENTATION.md |
| "What's the timeline?" | IMPLEMENTATION_ROADMAP.md |
| "What's the database schema?" | DATABASE_FORM_MAPPING.md |
| "Which doc do I need?" | ORGANIZER_DOCUMENTATION_INDEX.md |

---

## 💡 Pro Tips

1. **Start with INDEX** - Not sure where to start? Go here first
2. **Copy code directly** - All code is production-ready
3. **Test with curl** - Verify backend before frontend
4. **Check database** - Verify data persists after each test
5. **Use browser console** - Check Network tab for API calls
6. **Enable logging** - Help debug issues faster
7. **Test error cases** - Don't just test happy paths
8. **Document as you go** - Update team wiki

---

## 🔗 Quick Links

📖 **Documentation Index**  
→ ORGANIZER_DOCUMENTATION_INDEX.md

📊 **Implementation Roadmap**  
→ IMPLEMENTATION_ROADMAP.md

🛠️ **Backend Guide**  
→ BACKEND_API_IMPLEMENTATION_GUIDE.md

💻 **Frontend Guide**  
→ ORGANIZER_FORM_INTEGRATION_GUIDE.md

📚 **API Reference**  
→ ORGANIZER_API_DOCUMENTATION.md

🗄️ **Database Mapping**  
→ DATABASE_FORM_MAPPING.md

---

## ✨ You're All Set!

Everything you need to implement the Organizer Portal API is documented and ready to go. 

**Next Steps:**
1. Pick your role
2. Go to your recommended document
3. Start implementing
4. Reference other docs as needed
5. Test thoroughly
6. Deploy confidently

**Happy Coding! 🚀**

---

**Quick Reference Version**: 1.0  
**Created**: 2026-03-13  
**Last Updated**: 2026-03-13  

