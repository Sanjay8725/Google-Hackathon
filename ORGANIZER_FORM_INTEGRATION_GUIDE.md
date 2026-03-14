# Organizer Portal - Frontend Form Integration Guide

This guide shows how to connect HTML forms to backend API endpoints using JavaScript fetch.

---

## 1. EVENT MANAGEMENT - CREATE EVENT

### HTML Form (organizer-dashboard.html)
```html
<form id="createEventForm">
  <input type="text" id="newEventTitle" placeholder="Event Title" required>
  <textarea id="newEventDescription" placeholder="Description" required></textarea>
  <input type="date" id="newEventDate" required>
  <input type="time" id="newEventTime" required>
  <input type="text" id="newEventLocation" placeholder="Location" required>
  <select id="newEventCategory" required>
    <option value="">Select Category</option>
    <option value="Business">Business</option>
    <option value="Technical">Technical</option>
    <option value="Social">Social</option>
  </select>
  <select id="newEventMode" required>
    <option value="">Select Type</option>
    <option value="in-person">In-Person</option>
    <option value="virtual">Virtual</option>
    <option value="hybrid">Hybrid</option>
  </select>
  <input type="number" id="newEventCapacity" placeholder="Capacity" required>
  <button type="submit">Create Event</button>
</form>
```

### JavaScript Handler (organizer.js)
```javascript
// Add this to the DOMContentLoaded section

const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = {
      title: document.getElementById('newEventTitle').value.trim(),
      description: document.getElementById('newEventDescription').value.trim(),
      date: document.getElementById('newEventDate').value,
      start_time: document.getElementById('newEventTime').value,
      location: document.getElementById('newEventLocation').value.trim(),
      category: document.getElementById('newEventCategory').value,
      venue_type: document.getElementById('newEventMode').value,
      capacity: parseInt(document.getElementById('newEventCapacity').value)
    };

    try {
      // Validation
      if (!formData.title || formData.title.length < 5) {
        alert('Event title must be at least 5 characters');
        return;
      }
      if (!formData.description || formData.description.length < 10) {
        alert('Description must be at least 10 characters');
        return;
      }
      if (isNaN(formData.capacity) || formData.capacity <= 0) {
        alert('Capacity must be a positive number');
        return;
      }

      // API Call
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Event created successfully!');
        createEventForm.reset();
        
        // Refresh event list
        if (typeof loadOrganizerEvents === 'function') {
          loadOrganizerEvents();
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Error: ${error.message}`);
    }
  });
}
```

---

## 2. EVENT MANAGEMENT - LOAD AND DISPLAY EVENTS

### JavaScript Function (organizer.js)
```javascript
async function loadOrganizerEvents() {
  try {
    const response = await fetch('/api/events', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const result = await response.json();
    
    if (result.success && result.events) {
      const eventsList = document.getElementById('eventsList') || 
                        document.getElementById('organizerEvents');
      
      if (eventsList) {
        eventsList.innerHTML = result.events.map(event => `
          <div class="event-card" data-event-id="${event.id}">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Capacity:</strong> ${event.capacity} | <strong>Registered:</strong> ${event.registered}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${event.status.toLowerCase()}">${event.status}</span></p>
            <div class="event-actions">
              <button onclick="viewEventDetails(${event.id})">View Details</button>
              <button onclick="editEvent(${event.id})">Edit</button>
              <button onclick="deleteEvent(${event.id})" class="btn-danger">Delete</button>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading events:', error);
    alert('Failed to load events');
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.organizer-sidebar')) {
    loadOrganizerEvents();
  }
});
```

---

## 3. REGISTRATION - REGISTER ATTENDEE

### HTML Form (organizer-dashboard.html)
```html
<form id="registerAttendeeForm">
  <input type="text" id="attendeeEmail" placeholder="Attendee Email" required>
  <select id="eventSelect" required>
    <option value="">Select Event</option>
    <!-- Will be populated by JavaScript -->
  </select>
  <select id="ticketType" required>
    <option value="">Select Ticket Type</option>
    <option value="General">General Admission</option>
    <option value="VIP">VIP</option>
    <option value="Student">Student</option>
  </select>
  <button type="submit">Register Attendee</button>
</form>
```

### JavaScript Handler (organizer.js)
```javascript
const registerAttendeeForm = document.getElementById('registerAttendeeForm');
if (registerAttendeeForm) {
  registerAttendeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventId = document.getElementById('eventSelect').value;
    const email = document.getElementById('attendeeEmail').value.trim();
    const ticketType = document.getElementById('ticketType').value;

    try {
      // First, get user_id from email
      const userResponse = await fetch(`/api/users/by-email/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('User not found');
      }

      const userData = await userResponse.json();
      const userId = userData.user.id;

      // Then register attendee
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          user_id: userId,
          ticket_type: ticketType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register attendee');
      }

      const result = await response.json();
      if (result.success) {
        alert('Attendee registered successfully!');
        registerAttendeeForm.reset();
      }
    } catch (error) {
      console.error('Error registering attendee:', error);
      alert(`Error: ${error.message}`);
    }
  });
}
```

---

## 4. EXPENSE TRACKING - ADD EXPENSE

### HTML Form (expense.html)
```html
<form id="expenseForm">
  <input type="text" id="expenseTitle" placeholder="Expense Title" required>
  <select id="expenseCategory" required>
    <option value="">Select Category</option>
    <option value="Catering">Catering</option>
    <option value="Venue">Venue</option>
    <option value="Technical">Technical</option>
    <option value="Marketing">Marketing</option>
    <option value="Transportation">Transportation</option>
    <option value="Other">Other</option>
  </select>
  <input type="number" id="expenseAmount" placeholder="Amount" step="0.01" required>
  <input type="date" id="expenseDate" required>
  <select id="expensePaymentMethod">
    <option value="Credit Card">Credit Card</option>
    <option value="Bank Transfer">Bank Transfer</option>
    <option value="Cash">Cash</option>
    <option value="Check">Check</option>
  </select>
  <textarea id="expenseNotes" placeholder="Notes (optional)"></textarea>
  <button type="submit">Add Expense</button>
</form>
```

### JavaScript Handler (expense.js)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expenseForm');
  
  if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get current event ID (from URL or sessionStorage)
      const eventId = new URLSearchParams(window.location.search).get('eventId') ||
                     sessionStorage.getItem('currentEventId');

      if (!eventId) {
        alert('No event selected. Please select an event first.');
        return;
      }

      const formData = {
        title: document.getElementById('expenseTitle').value.trim(),
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        expense_date: document.getElementById('expenseDate').value,
        payment_method: document.getElementById('expensePaymentMethod').value,
        notes: document.getElementById('expenseNotes').value.trim()
      };

      try {
        // Validation
        if (!formData.title || formData.title.length < 3) {
          alert('Expense title must be at least 3 characters');
          return;
        }
        if (isNaN(formData.amount) || formData.amount <= 0) {
          alert('Amount must be a positive number');
          return;
        }

        // API Call
        const response = await fetch(`/api/events/${eventId}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add expense');
        }

        const result = await response.json();
        
        if (result.success) {
          alert('Expense added successfully!');
          expenseForm.reset();
          
          // Refresh expense list
          if (typeof loadExpenses === 'function') {
            loadExpenses(eventId);
          }
        }
      } catch (error) {
        console.error('Error adding expense:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }
});

// Load expenses for the current event
async function loadExpenses(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/expenses`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    const result = await response.json();
    
    if (result.success && result.expenses) {
      const expensesList = document.getElementById('expensesList');
      
      if (expensesList) {
        expensesList.innerHTML = result.expenses.map(expense => `
          <div class="expense-item">
            <div class="expense-header">
              <h4>${expense.title}</h4>
              <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
            </div>
            <p><strong>Category:</strong> ${expense.category}</p>
            <p><strong>Date:</strong> ${new Date(expense.expense_date).toLocaleDateString()}</p>
            <p><strong>Method:</strong> ${expense.payment_method}</p>
            ${expense.notes ? `<p><strong>Notes:</strong> ${expense.notes}</p>` : ''}
            <div class="expense-actions">
              <button onclick="editExpense(${expense.id})">Edit</button>
              <button onclick="deleteExpense(${expense.id})" class="btn-danger">Delete</button>
            </div>
          </div>
        `).join('');

        // Update summary
        const totalExpenses = document.getElementById('totalExpenses');
        if (totalExpenses) {
          totalExpenses.textContent = `$${result.total_expenses.toFixed(2)}`;
        }
      }
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
  }
}
```

---

## 5. VENDOR MANAGEMENT - ADD VENDOR

### HTML Form (vendors.html)
```html
<form id="vendorForm">
  <input type="text" id="vendorName" placeholder="Vendor Name" required>
  <input type="text" id="vendorContact" placeholder="Contact Person" required>
  <input type="email" id="vendorEmail" placeholder="Email" required>
  <input type="tel" id="vendorPhone" placeholder="Phone" required>
  <input type="text" id="vendorCategory" placeholder="Category" required>
  <input type="text" id="boothLocation" placeholder="Booth Location">
  <input type="number" id="boothFee" placeholder="Booth Fee" step="0.01">
  <textarea id="vendorNotes" placeholder="Notes (optional)"></textarea>
  <button type="submit">Add Vendor</button>
</form>
```

### JavaScript Handler (vendors.js)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const vendorForm = document.getElementById('vendorForm');
  
  if (vendorForm) {
    vendorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const eventId = new URLSearchParams(window.location.search).get('eventId') ||
                     sessionStorage.getItem('currentEventId');

      if (!eventId) {
        alert('No event selected. Please select an event first.');
        return;
      }

      const formData = {
        vendor_name: document.getElementById('vendorName').value.trim(),
        vendor_contact: document.getElementById('vendorContact').value.trim(),
        vendor_email: document.getElementById('vendorEmail').value.trim(),
        vendor_phone: document.getElementById('vendorPhone').value.trim(),
        vendor_category: document.getElementById('vendorCategory').value.trim(),
        booth_location: document.getElementById('boothLocation').value.trim() || null,
        booth_fee: document.getElementById('boothFee').value ? 
                  parseFloat(document.getElementById('boothFee').value) : null,
        notes: document.getElementById('vendorNotes').value.trim()
      };

      try {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.vendor_email)) {
          alert('Please enter a valid email address');
          return;
        }

        // API Call
        const response = await fetch(`/api/events/${eventId}/vendors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add vendor');
        }

        const result = await response.json();
        
        if (result.success) {
          alert('Vendor added successfully!');
          vendorForm.reset();
          
          if (typeof loadVendors === 'function') {
            loadVendors(eventId);
          }
        }
      } catch (error) {
        console.error('Error adding vendor:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }
});

// Load vendors for current event
async function loadVendors(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/vendors`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }

    const result = await response.json();
    
    if (result.success && result.vendors) {
      const vendorsList = document.getElementById('vendorsList');
      
      if (vendorsList) {
        vendorsList.innerHTML = result.vendors.map(vendor => `
          <div class="vendor-card">
            <h4>${vendor.vendor_name}</h4>
            <p><strong>Contact:</strong> ${vendor.vendor_contact}</p>
            <p><strong>Email:</strong> <a href="mailto:${vendor.vendor_email}">${vendor.vendor_email}</a></p>
            <p><strong>Phone:</strong> ${vendor.vendor_phone}</p>
            <p><strong>Category:</strong> ${vendor.vendor_category}</p>
            ${vendor.booth_location ? `<p><strong>Booth:</strong> ${vendor.booth_location}</p>` : ''}
            ${vendor.booth_fee ? `<p><strong>Fee:</strong> $${vendor.booth_fee.toFixed(2)}</p>` : ''}
            <p><strong>Payment:</strong> <span class="status-${vendor.payment_status}">${vendor.payment_status}</span></p>
            <div class="vendor-actions">
              <button onclick="editVendor(${vendor.id})">Edit</button>
              <button onclick="deleteVendor(${vendor.id})" class="btn-danger">Delete</button>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading vendors:', error);
  }
}
```

---

## 6. ANALYTICS - LOAD DASHBOARD

### JavaScript Function (analytics.js)
```javascript
async function loadAnalytics(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/analytics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    const result = await response.json();
    
    if (result.success && result.analytics) {
      const analytics = result.analytics;
      
      // Update dashboard cards
      updateAnalyticsCard('totalRegistrations', analytics.total_registrations);
      updateAnalyticsCard('checkIns', analytics.check_ins);
      updateAnalyticsCard('noShows', analytics.no_shows);
      updateAnalyticsCard('engagementScore', `${analytics.engagement_score.toFixed(1)}%`);
      updateAnalyticsCard('averageRating', `${analytics.average_rating}/5`);
      updateAnalyticsCard('revenue', `$${analytics.revenue_generated.toFixed(2)}`);
      updateAnalyticsCard('expenses', `$${analytics.total_expenses.toFixed(2)}`);
      updateAnalyticsCard('profit', `$${analytics.profit.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

function updateAnalyticsCard(cardId, value) {
  const card = document.getElementById(cardId);
  if (card) {
    card.textContent = value;
  }
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
  const eventId = new URLSearchParams(window.location.search).get('eventId') ||
                 sessionStorage.getItem('currentEventId');
  if (eventId) {
    loadAnalytics(eventId);
  }
});
```

---

## 7. SETTINGS - UPDATE ORGANIZER PROFILE

### HTML Form (settings.html)
```html
<form id="settingsForm">
  <input type="text" id="organizationName" placeholder="Organization Name" required>
  <input type="text" id="website" placeholder="Website" required>
  <input type="tel" id="phone" placeholder="Contact Phone" required>
  <textarea id="address" placeholder="Office Address" required></textarea>
  <input type="text" id="taxId" placeholder="Tax ID">
  <input type="text" id="bankAccount" placeholder="Bank Account (last 4 digits)">
  <button type="submit">Save Settings</button>
</form>
```

### JavaScript Handler (settings.js)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Load current settings
  loadOrganizerSettings();
  
  const settingsForm = document.getElementById('settingsForm');
  
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        organization_name: document.getElementById('organizationName').value.trim(),
        website: document.getElementById('website').value.trim(),
        contact_phone: document.getElementById('phone').value.trim(),
        office_address: document.getElementById('address').value.trim(),
        tax_id: document.getElementById('taxId').value.trim() || null,
        bank_account: document.getElementById('bankAccount').value.trim() || null
      };

      try {
        // Validation
        if (!formData.organization_name || formData.organization_name.length < 3) {
          alert('Organization name must be at least 3 characters');
          return;
        }

        const response = await fetch('/api/organizers/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        const result = await response.json();
        
        if (result.success) {
          alert('Profile updated successfully!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }
});

async function loadOrganizerSettings() {
  try {
    const response = await fetch('/api/organizers/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const result = await response.json();
    
    if (result.success && result.organizer) {
      const org = result.organizer;
      document.getElementById('organizationName').value = org.organization_name || '';
      document.getElementById('website').value = org.website || '';
      document.getElementById('phone').value = org.contact_phone || '';
      document.getElementById('address').value = org.office_address || '';
      document.getElementById('taxId').value = org.tax_id || '';
      document.getElementById('bankAccount').value = org.bank_account ? 
        `****${org.bank_account.slice(-4)}` : '';
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}
```

---

## 8. COMMON PATTERNS & UTILITIES

### Check Authentication Token
```javascript
function getAuthToken() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/auth.html';
    return null;
  }
  return token;
}
```

### Handle API Errors Uniformly
```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = getAuthToken();
  if (!token) return null;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, options);
    
    if (response.status === 401) {
      // Token expired, logout
      localStorage.removeItem('authToken');
      window.location.href = '/auth.html';
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Usage Example
```javascript
// Instead of individual fetch calls, use:
const result = await apiCall('/api/events', 'GET');
const newEvent = await apiCall('/api/events', 'POST', eventData);
```

---

## 9. IMPLEMENTATION CHECKLIST

- [ ] Create Event form integration (organizer.js)
- [ ] Load events list on page load
- [ ] Display events with edit/delete buttons
- [ ] Register attendee form integration
- [ ] Add expense form integration (expense.js)
- [ ] Load and display expenses list
- [ ] Calculate total expenses
- [ ] Add vendor form integration (vendors.js)
- [ ] Load and display vendors list
- [ ] Load analytics data (analytics.js)
- [ ] Update organizer settings form (settings.js)
- [ ] Load current settings on page load
- [ ] Add form validation for all inputs
- [ ] Add error handling and user feedback
- [ ] Add loading indicators during API calls
- [ ] Test all forms against backend
- [ ] Add success/error notifications
- [ ] Handle expired authentication tokens

---

## 10. TESTING

### Test Create Event
```javascript
// Run in browser console
await apiCall('/api/events', 'POST', {
  title: 'Test Event',
  description: 'Test Description',
  date: '2026-04-15',
  start_time: '09:00:00',
  location: 'Test Location',
  category: 'Business',
  venue_type: 'in-person',
  capacity: 100
});
```

### Test Add Expense
```javascript
// Run in browser console
await apiCall('/api/events/45/expenses', 'POST', {
  title: 'Test Expense',
  category: 'Catering',
  amount: 500.00,
  expense_date: '2026-03-13',
  payment_method: 'Credit Card',
  notes: 'Test'
});
```

---

