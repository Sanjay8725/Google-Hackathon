# Database Form Mapping Guide
## EventFlow - Organizer Portal Forms to Database Schema

---

## 1. EVENT MANAGEMENT

### Form: Create Event (organizer-dashboard.html)
**Form ID**: `createEventForm`

**Form Fields**:
- newEventTitle (text) → events.title
- newEventDate (date) → events.date  
- newEventTime (time) → events.start_time
- newEventLocation (text) → events.location
- newEventCategory (select) → events.category
- newEventMode (select/Online|Offline) → events.venue_type
- newEventDescription (text) → events.description

**Database Table**: `events`
**Required Fields in DB**:
- title VARCHAR(200) NOT NULL
- description TEXT
- date DATE NOT NULL
- start_time TIME
- location VARCHAR(255)
- venue_type ENUM('in-person', 'virtual', 'hybrid')
- category VARCHAR(50)
- organizer_id INT NOT NULL (from logged-in user)

**SQL Query**:
```sql
INSERT INTO events (
  organizer_id, title, description, date, start_time, 
  location, venue_type, category, created_at
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, NOW()
);
```

---

### Form: Register Attendee to Event (organizer-dashboard.html)
**Form ID**: `eventRegisterForm`

**Form Fields**:
- regEventId (text) → registrations.event_id
- regUserId (text) → registrations.user_id
- regTicketType (text) → registrations.ticket_type

**Database Table**: `registrations`
**Required Fields in DB**:
- event_id INT NOT NULL
- user_id INT NOT NULL
- ticket_type VARCHAR(50) DEFAULT 'General'
- registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- status ENUM('registered', 'checked-in', 'no-show') DEFAULT 'registered'

**SQL Query**:
```sql
INSERT INTO registrations (
  event_id, user_id, ticket_type, registration_date, status
) VALUES (
  ?, ?, ?, NOW(), 'registered'
);
```

---

## 2. EXPENSE TRACKING

### Form: Add Expense (expense.html)
**Form ID**: `expenseForm`

**Form Fields**:
- expenseTitle (text) → event_expenses.title
- expenseCategory (text) → event_expenses.category
- expenseAmount (number) → event_expenses.amount
- expenseDate (date) → event_expenses.expense_date
- expenseNotes (text) → event_expenses.notes
- expenseEventId (select/dropdown) → event_expenses.event_id

**Database Table**: `event_expenses`
**Required Fields in DB**:
- event_id INT NOT NULL
- title VARCHAR(200) NOT NULL
- category VARCHAR(100) DEFAULT 'General'
- amount DECIMAL(10,2) NOT NULL
- expense_date DATE NOT NULL
- notes TEXT
- payment_method VARCHAR(50) DEFAULT 'Other'

**SQL Query**:
```sql
INSERT INTO event_expenses (
  event_id, title, category, amount, expense_date, notes, created_at
) VALUES (
  ?, ?, ?, ?, ?, ?, NOW()
);
```

---

## 3. VENDOR MANAGEMENT

### Form: Add Vendor (vendors.html - Dynamic)
**Form ID**: `vendorForm` (to be created)

**Form Fields** (Expected):
- vendor_name (text) → event_vendors.vendor_name
- vendor_contact (text) → event_vendors.vendor_contact
- vendor_email (email) → event_vendors.vendor_email
- vendor_phone (tel) → event_vendors.vendor_phone
- booth_location (text) → event_vendors.booth_location
- vendor_category (select) → event_vendors.vendor_category
- booth_fee (number) → event_vendors.booth_fee
- event_id (select) → event_vendors.event_id
- notes (textarea) → event_vendors.notes

**Database Table**: `event_vendors`
**Fields in DB**:
- event_id INT NOT NULL
- vendor_name VARCHAR(200) NOT NULL
- vendor_contact VARCHAR(255)
- vendor_email VARCHAR(100)
- vendor_phone VARCHAR(20)
- booth_location VARCHAR(100)
- vendor_category VARCHAR(100)
- payment_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending'
- booth_fee DECIMAL(10,2)
- notes TEXT

**SQL Query**:
```sql
INSERT INTO event_vendors (
  event_id, vendor_name, vendor_contact, vendor_email, vendor_phone,
  booth_location, vendor_category, booth_fee, notes, created_at
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
);
```

---

## 4. ANALYTICS & ENGAGEMENT

### Table: engagement_logs
**Purpose**: Track organizer interactions and event engagement
**Fields**:
- id INT PRIMARY KEY AUTO_INCREMENT
- organizer_id INT NOT NULL
- event_id INT NOT NULL
- action VARCHAR(100) - Types: view_event, create_event, update_event, add_expense, add_vendor
- action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- details JSON - Additional metadata

**SQL**:
```sql
CREATE TABLE IF NOT EXISTS engagement_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  event_id INT,
  action VARCHAR(100) NOT NULL,
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSON,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_organizer (organizer_id),
  INDEX idx_action_date (action_date)
);
```

---

## 5. SETTINGS & PROFILE

### Form: Organizer Settings (settings.html - Dynamic)
**Form ID**: `settingsForm` (to be created)

**Form Fields** (Expected):
- organization_name (text) → organizer_profiles.organization_name
- contact_phone (tel) → organizer_profiles.contact_phone
- office_address (text) → organizer_profiles.office_address
- website (url) → organizer_profiles.website
- tax_id (text) → organizer_profiles.tax_id
- bank_account (text) → organizer_profiles.bank_account

**Database Table**: `organizer_profiles`
**Fields in DB**:
- user_id INT NOT NULL UNIQUE
- organization_name VARCHAR(200)
- contact_phone VARCHAR(20)
- office_address VARCHAR(255)
- website VARCHAR(255)
- tax_id VARCHAR(50)
- bank_account VARCHAR(50)
- verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending'

**SQL Query**:
```sql
UPDATE organizer_profiles SET
  organization_name = ?,
  contact_phone = ?,
  office_address = ?,
  website = ?,
  tax_id = ?,
  bank_account = ?
WHERE user_id = ?;
```

---

## BACKEND API ENDPOINTS NEEDED

### Events API
```
POST   /api/events              - Create event
GET    /api/events              - Get organizer's events
GET    /api/events/:id          - Get event details
PUT    /api/events/:id          - Update event
DELETE /api/events/:id          - Delete event
```

### Registrations API
```
POST   /api/events/:id/register         - Register attendee
GET    /api/events/:id/registrations    - Get event registrations
```

### Expenses API  
```
POST   /api/events/:id/expenses         - Add event expense
GET    /api/events/:id/expenses         - Get event expenses
PUT    /api/expenses/:id                - Update expense
DELETE /api/expenses/:id                - Delete expense
```

### Vendors API
```
POST   /api/events/:id/vendors          - Add vendor
GET    /api/events/:id/vendors          - Get event vendors
PUT    /api/vendors/:id                 - Update vendor
DELETE /api/vendors/:id                 - Delete vendor
```

### Analytics API
```
GET    /api/analytics/dashboard         - Get organizer dashboard stats
GET    /api/analytics/events            - Get event analytics
GET    /api/analytics/engagement        - Get engagement metrics
```

### Settings API
```
GET    /api/organizers/profile          - Get organizer profile
PUT    /api/organizers/profile          - Update organizer profile
```

---

## DATABASE INITIALIZATION

To initialize the database with the schema:

```bash
cd backend/server/database
mysql -u root -p < schema.sql
mysql -u root -p < test_data.sql
```

---

## FORM VALIDATION REQUIREMENTS

### Create Event Form
- Title: Required, min 5 chars, max 200 chars
- Date: Required, must be current or future date
- Time: Optional (use date if not specified)
- Location: Required, min 5 chars
- Category: Required, enum from predefined list
- Mode: Required, one of [Online, Offline, Hybrid]
- Description: Optional, max 1000 chars

### Add Expense Form
- Title: Required, min 3 chars, max 200 chars
- Category: Optional (defaults to 'General')
- Amount: Required, positive number, max 2 decimal places
- Date: Required, must be current or past date
- Notes: Optional, max 500 chars

### Add Vendor Form
- Vendor Name: Required, min 3 chars, max 200 chars
- Email: Required, valid email format
- Phone: Required, valid phone format
- Booth Location: Optional
- Category: Required
- Booth Fee: Optional, positive number

---

## DATA RELATIONSHIPS

```
users (organizer)
  ├── events
  │   ├── registrations (attendees)
  │   ├── event_expenses
  │   ├── event_vendors
  │   └── event_sessions
  ├── organizer_profiles
  └── engagement_logs
```

---

## NOTES

1. **Organizer Context**: All forms should include the logged-in organizer's ID
2. **Timestamps**: All forms should auto-add `created_at` and `updated_at` 
3. **Status Tracking**: Events and vendors have status fields for tracking lifecycle
4. **Error Handling**: All form submissions should validate data before DB insertion
5. **Audit Trail**: Consider logging all CRUD operations for compliance

