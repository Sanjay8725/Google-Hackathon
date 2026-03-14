# Organizer Portal - API Integration Guide

## Overview
This guide provides complete API endpoint documentation for the Organizer Portal forms and database operations.

---

## API BASE URL
```
http://localhost:3000/api
```

---

## 1. EVENT MANAGEMENT ENDPOINTS

### 1.1 Create Event
**Endpoint**: `POST /events`  
**Auth Required**: Yes (Organizer)  
**Form**: Create Event (organizer-dashboard.html)

**Request Body**:
```json
{
  "title": "Tech Conference 2026",
  "description": "Annual technology conference",
  "date": "2026-04-15",
  "start_time": "09:00:00",
  "location": "Convention Center, Downtown",
  "venue_type": "in-person",
  "category": "Business",
  "capacity": 500
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "eventId": 45,
  "message": "Event created successfully",
  "event": {
    "id": 45,
    "organizer_id": 12,
    "title": "Tech Conference 2026",
    "date": "2026-04-15",
    "status": "Planning",
    "created_at": "2026-03-13T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: Invalid input (missing required fields)
- 401: Unauthorized
- 403: User is not an organizer

---

### 1.2 Get Organizer's Events
**Endpoint**: `GET /events`  
**Auth Required**: Yes (Organizer)  
**Query Parameters**: 
- `status` (optional): Planning, Live, Upcoming, Completed, Cancelled
- `page` (optional): Default 1
- `limit` (optional): Default 10

**Response (200 OK)**:
```json
{
  "success": true,
  "events": [
    {
      "id": 45,
      "title": "Tech Conference 2026",
      "date": "2026-04-15",
      "status": "Planning",
      "registered": 120,
      "capacity": 500,
      "created_at": "2026-03-13T10:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

---

### 1.3 Get Event Details
**Endpoint**: `GET /events/:eventId`  
**Auth Required**: Yes (Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "event": {
    "id": 45,
    "title": "Tech Conference 2026",
    "description": "Annual technology conference",
    "date": "2026-04-15",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "location": "Convention Center",
    "venue_type": "in-person",
    "category": "Business",
    "capacity": 500,
    "registered": 120,
    "checked_in": 95,
    "no_show": 5,
    "status": "Planning",
    "engagement": 78.5,
    "avg_rating": 4.5,
    "feedback_count": 45,
    "created_at": "2026-03-13T10:30:00Z"
  }
}
```

---

### 1.4 Update Event
**Endpoint**: `PUT /events/:eventId`  
**Auth Required**: Yes (Event Organizer)

**Request Body** (all fields optional):
```json
{
  "title": "Tech Conference 2026 - Updated",
  "description": "Updated description",
  "date": "2026-04-20",
  "location": "New Venue",
  "capacity": 600,
  "status": "Upcoming"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event updated successfully"
}
```

---

### 1.5 Delete Event
**Endpoint**: `DELETE /events/:eventId`  
**Auth Required**: Yes (Event Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## 2. REGISTRATION ENDPOINTS

### 2.1 Register Attendee to Event
**Endpoint**: `POST /events/:eventId/register`  
**Auth Required**: Yes  
**Form**: Register Attendee to Event (organizer-dashboard.html)

**Request Body**:
```json
{
  "user_id": 89,
  "ticket_type": "General"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "registrationId": 2345,
  "message": "Attendee registered successfully",
  "registration": {
    "id": 2345,
    "event_id": 45,
    "user_id": 89,
    "ticket_type": "General",
    "registration_date": "2026-03-13T10:30:00Z",
    "payment_status": "completed",
    "qr_code": "EVENT45_USER89_REG2345"
  }
}
```

**Error Responses**:
- 409: User already registered for this event
- 400: Event capacity full

---

### 2.2 Get Event Registrations
**Endpoint**: `GET /events/:eventId/registrations`  
**Auth Required**: Yes (Event Organizer or Admin)

**Response (200 OK)**:
```json
{
  "success": true,
  "registrations": [
    {
      "id": 2345,
      "user_id": 89,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "ticket_type": "General",
      "registration_date": "2026-03-13T10:30:00Z",
      "payment_status": "completed",
      "attended": true,
      "check_in_time": "2026-04-15T09:15:00Z"
    }
  ],
  "total": 120
}
```

---

### 2.3 Check-in Attendee
**Endpoint**: `POST /events/:eventId/checkin`  
**Auth Required**: Yes (Event Organizer or Staff)

**Request Body**:
```json
{
  "qr_code": "EVENT45_USER89_REG2345",
  "check_in_method": "QR"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Attendee checked in",
  "attendee": {
    "user_id": 89,
    "user_name": "John Doe",
    "check_in_time": "2026-04-15T09:15:00Z"
  }
}
```

---

## 3. EXPENSE TRACKING ENDPOINTS

### 3.1 Add Event Expense
**Endpoint**: `POST /events/:eventId/expenses`  
**Auth Required**: Yes (Event Organizer)  
**Form**: Add Expense (expense.html)

**Request Body**:
```json
{
  "title": "Stage Lighting Equipment",
  "category": "Technical",
  "amount": 1500.00,
  "expense_date": "2026-03-10",
  "payment_method": "Credit Card",
  "notes": "Professional stage lighting rental"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "expenseId": 567,
  "message": "Expense added successfully",
  "expense": {
    "id": 567,
    "event_id": 45,
    "title": "Stage Lighting Equipment",
    "category": "Technical",
    "amount": 1500.00,
    "expense_date": "2026-03-10",
    "created_at": "2026-03-13T10:30:00Z"
  }
}
```

---

### 3.2 Get Event Expenses
**Endpoint**: `GET /events/:eventId/expenses`  
**Auth Required**: Yes (Event Organizer)

**Query Parameters**:
- `category` (optional): Filter by category
- `start_date` (optional): From date
- `end_date` (optional): To date

**Response (200 OK)**:
```json
{
  "success": true,
  "expenses": [
    {
      "id": 567,
      "title": "Stage Lighting Equipment",
      "category": "Technical",
      "amount": 1500.00,
      "expense_date": "2026-03-10",
      "payment_method": "Credit Card",
      "notes": "Professional stage lighting rental",
      "created_at": "2026-03-13T10:30:00Z"
    }
  ],
  "total_expenses": 15000.00,
  "expense_count": 12
}
```

---

### 3.3 Update Expense
**Endpoint**: `PUT /expenses/:expenseId`  
**Auth Required**: Yes (Event Organizer)

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "category": "Updated category",
  "amount": 1600.00,
  "notes": "Updated notes"
}
```

---

### 3.4 Delete Expense
**Endpoint**: `DELETE /expenses/:expenseId`  
**Auth Required**: Yes (Event Organizer)

---

## 4. VENDOR MANAGEMENT ENDPOINTS

### 4.1 Add Vendor to Event
**Endpoint**: `POST /events/:eventId/vendors`  
**Auth Required**: Yes (Event Organizer)  
**Form**: Add Vendor (vendors.html)

**Request Body**:
```json
{
  "vendor_name": "Premium Catering Co",
  "vendor_contact": "Jane Smith",
  "vendor_email": "contact@catering.com",
  "vendor_phone": "+1-555-0123",
  "booth_location": "Hall A - Booth 12",
  "vendor_category": "Food & Beverage",
  "booth_fee": 2500.00,
  "notes": "Provides vegetarian options"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "vendorId": 234,
  "message": "Vendor added successfully",
  "vendor": {
    "id": 234,
    "event_id": 45,
    "vendor_name": "Premium Catering Co",
    "vendor_email": "contact@catering.com",
    "booth_fee": 2500.00,
    "payment_status": "pending",
    "created_at": "2026-03-13T10:30:00Z"
  }
}
```

---

### 4.2 Get Event Vendors
**Endpoint**: `GET /events/:eventId/vendors`  
**Auth Required**: Yes (Event Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "vendors": [
    {
      "id": 234,
      "vendor_name": "Premium Catering Co",
      "vendor_contact": "Jane Smith",
      "vendor_email": "contact@catering.com",
      "booth_location": "Hall A - Booth 12",
      "vendor_category": "Food & Beverage",
      "booth_fee": 2500.00,
      "payment_status": "pending",
      "created_at": "2026-03-13T10:30:00Z"
    }
  ],
  "total": 8
}
```

---

### 4.3 Update Vendor
**Endpoint**: `PUT /vendors/:vendorId`  
**Auth Required**: Yes (Event Organizer)

**Request Body** (all fields optional):
```json
{
  "vendor_name": "Updated name",
  "booth_fee": 3000.00,
  "payment_status": "completed",
  "notes": "Updated notes"
}
```

---

### 4.4 Delete Vendor
**Endpoint**: `DELETE /vendors/:vendorId`  
**Auth Required**: Yes (Event Organizer)

---

## 5. ANALYTICS ENDPOINTS

### 5.1 Get Dashboard Analytics
**Endpoint**: `GET /analytics/dashboard`  
**Auth Required**: Yes (Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "dashboard": {
    "total_events": 45,
    "active_events": 12,
    "total_attendees": 5000,
    "total_revenue": 125000.00,
    "average_satisfaction": 4.3,
    "events_this_month": 8,
    "upcoming_events": 15
  }
}
```

---

### 5.2 Get Event Analytics
**Endpoint**: `GET /events/:eventId/analytics`  
**Auth Required**: Yes (Event Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "analytics": {
    "total_registrations": 150,
    "check_ins": 135,
    "no_shows": 5,
    "engagement_score": 78.5,
    "average_rating": 4.5,
    "feedback_count": 120,
    "revenue_generated": 7500.00,
    "total_expenses": 5000.00,
    "profit": 2500.00
  }
}
```

---

### 5.3 Get Engagement Metrics
**Endpoint**: `GET /events/:eventId/engagement`  
**Auth Required**: Yes (Event Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "engagement": {
    "session_attendance": 78.5,
    "feedback_submission": 80.0,
    "interaction_rate": 65.3,
    "average_time_spent_minutes": 240,
    "top_sessions": [
      {
        "session_id": 101,
        "session_name": "Keynote Address",
        "attendance_rate": 95.0,
        "engagement_score": 8.2
      }
    ]
  }
}
```

---

## 6. SETTINGS & PROFILE ENDPOINTS

### 6.1 Get Organizer Profile
**Endpoint**: `GET /organizers/profile`  
**Auth Required**: Yes (Organizer)

**Response (200 OK)**:
```json
{
  "success": true,
  "organizer": {
    "user_id": 12,
    "name": "EventFlow Org",
    "organization_name": "EventFlow Organizers Inc",
    "contact_phone": "+1-555-1234",
    "office_address": "123 Event St, NYC",
    "website": "www.eventflow.com",
    "tax_id": "12-3456789",
    "total_events": 45,
    "total_attendees": 5000,
    "verification_status": "verified"
  }
}
```

---

### 6.2 Update Organizer Profile
**Endpoint**: `PUT /organizers/profile`  
**Auth Required**: Yes (Organizer)  
**Form**: Settings (settings.html)

**Request Body** (all fields optional):
```json
{
  "organization_name": "EventFlow Updated",
  "contact_phone": "+1-555-9999",
  "office_address": "456 New St, LA",
  "website": "www.eventflow-new.com",
  "tax_id": "12-3456789-2",
  "bank_account": "****5678"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 7. ERROR HANDLING

All endpoints follow this error response format:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Invalid input",
  "details": {
    "field": "title",
    "message": "Title is required and must be at least 5 characters"
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Please login to continue"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Event with ID 999 not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 8. AUTHENTICATION

All protected endpoints require:
- Bearer Token in Authorization header: `Authorization: Bearer <token>`
- Token obtained from login endpoint: `POST /auth/login`

---

## 9. RATE LIMITING

- 100 requests per minute per API key
- 1000 requests per hour per API key

---

## 10. DATA VALIDATION REQUIREMENTS

### Event Validation
- title: Required, 5-200 chars
- date: Required, must be current or future
- location: Required, 5-255 chars
- category: Required, enum value
- venue_type: Required, one of [in-person, virtual, hybrid]

### Expense Validation
- title: Required, 3-200 chars
- amount: Required, positive decimal, max 2 decimals
- expense_date: Required, current or past date

### Vendor Validation
- vendor_name: Required, 3-200 chars
- vendor_email: Required, valid email
- vendor_phone: Required, valid phone
- booth_fee: Optional, positive decimal

---

## 11. EXAMPLE CURL COMMANDS

Create Event:
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference",
    "date": "2026-04-15",
    "location": "Convention Center",
    "category": "Business",
    "venue_type": "in-person"
  }'
```

Add Expense:
```bash
curl -X POST http://localhost:3000/api/events/45/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Stage Lighting",
    "amount": 1500.00,
    "expense_date": "2026-03-10",
    "category": "Technical"
  }'
```

Get Dashboard:
```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

