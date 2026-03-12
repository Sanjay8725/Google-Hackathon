// Frontend Integration Guide for API

/* 
 * This file demonstrates how to integrate the existing frontend with the new MySQL backend
 * 
 * KEY CHANGES NEEDED IN app.js:
 * 
 * 1. Update handleAuth function to call API
 * 2. Load events from database instead of local state
 * 3. Create event through API
 * 4. Update QR check-in to use backend
 * 5. Fetch analytics from database
 */

// ===== 1. UPDATE handleAuth FUNCTION =====
async function handleAuth(e) {
  e.preventDefault();

  if (!appState.userRole) {
    alert('Please select a role');
    return;
  }

  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName').value;
  const isLogin = document.getElementById('loginBtn').classList.contains('active');

  try {
    let result;
    
    if (isLogin) {
      // Login
      result = await api.login({ email, password, role: appState.userRole });
    } else {
      // Register
      result = await api.register({ 
        name, 
        email, 
        password, 
        role: appState.userRole 
      });
    }

    if (result.success) {
      appState.isLoggedIn = true;
      appState.user = result.user;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(result.user));

      if (appState.user.role === 'organizer') {
        navigateTo('organizer-dashboard');
      } else {
        navigateTo('attendee-dashboard');
      }
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert('Authentication failed. Please try again.');
  }
}

// ===== 2. LOAD EVENTS FROM DATABASE =====
async function loadOrganizerDashboard() {
  try {
    // Fetch organizer's events
    const eventsResult = await api.getOrganizerEvents(appState.user.id);
    
    if (!eventsResult.success) {
      console.error('Failed to load events');
      return;
    }

    appState.events = eventsResult.events;

    // Fetch dashboard analytics
    const analyticsResult = await api.getDashboardAnalytics(appState.user.id);
    
    if (analyticsResult.success) {
      appState.analytics = analyticsResult.stats.summary;
    }

    // Render dashboard with fetched data
    renderOrganizerDashboard();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Failed to load dashboard. Please refresh.');
  }
}

// ===== 3. CREATE EVENT THROUGH API =====
async function addNewEvent(eventData) {
  try {
    const result = await api.createEvent({
      organizer_id: appState.user.id,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      capacity: eventData.capacity,
      category: eventData.category,
      image_url: eventData.image_url
    });

    if (result.success) {
      alert('Event created successfully!');
      // Reload dashboard
      loadOrganizerDashboard();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Failed to create event.');
  }
}

// ===== 4. UPDATE QR CHECK-IN =====
async function simulateQRScan(eventId) {
  try {
    // Get event registrations
    const regResult = await api.getEventRegistrations(eventId);
    
    if (!regResult.success || regResult.registrations.length === 0) {
      alert('No registrations found for this event');
      return;
    }

    // Simulate scanning first registration
    const registration = regResult.registrations[0];
    
    // Check-in
    const checkInResult = await api.checkIn({
      event_id: eventId,
      user_id: registration.user_id,
      qr_code: registration.qr_code,
      check_in_method: 'QR'
    });

    if (checkInResult.success) {
      alert(`✅ Check-in successful for ${registration.name}!`);
      
      // Track engagement
      await api.trackEngagement({
        event_id: eventId,
        user_id: registration.user_id,
        action: 'qr_checkin'
      });

      // Reload dashboard to show updated numbers
      loadOrganizerDashboard();
    } else {
      alert(checkInResult.message);
    }
  } catch (error) {
    console.error('QR scan error:', error);
    alert('QR scan failed. Please try again.');
  }
}

// ===== 5. FETCH ANALYTICS FROM DATABASE =====
async function viewEventAnalytics(eventId) {
  try {
    const result = await api.getEventAnalytics(eventId);
    
    if (!result.success) {
      alert('Failed to load analytics');
      return;
    }

    const analytics = result.analytics;
    
    // Display analytics modal with data from backend
    showAnalyticsModal(analytics);
  } catch (error) {
    console.error('Error loading analytics:', error);
    alert('Failed to load analytics.');
  }
}

// ===== 6. REGISTER FOR EVENT (ATTENDEE) =====
async function registerForEvent(eventId) {
  try {
    const result = await api.registerForEvent(eventId, appState.user.id);
    
    if (result.success) {
      alert('✅ Registration successful! Your QR code: ' + result.qr_code);
      
      // Track engagement
      await api.trackEngagement({
        event_id: eventId,
        user_id: appState.user.id,
        action: 'event_registration'
      });

      // Reload attendee dashboard
      loadAttendeeDashboard();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
}

// ===== 7. SUBMIT FEEDBACK =====
async function submitFeedback(eventId, rating, comment) {
  try {
    const result = await api.submitFeedback({
      event_id: eventId,
      user_id: appState.user.id,
      rating: rating,
      comment: comment
    });

    if (result.success) {
      alert('✅ Thank you for your feedback!');
      
      // Track engagement
      await api.trackEngagement({
        event_id: eventId,
        user_id: appState.user.id,
        action: 'feedback_submission'
      });

      // Reload dashboard
      loadAttendeeDashboard();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Feedback error:', error);
    alert('Failed to submit feedback.');
  }
}

// ===== 8. LOAD ATTENDEE DASHBOARD =====
async function loadAttendeeDashboard() {
  try {
    // Get all events
    const eventsResult = await api.getAllEvents();
    
    if (!eventsResult.success) {
      console.error('Failed to load events');
      return;
    }

    // Get user's registrations (from attendance)
    const attendanceResult = await api.getUserAttendance(appState.user.id);
    
    appState.events = eventsResult.events;
    appState.userAttendance = attendanceResult.success ? attendanceResult.attendance : [];

    // Render attendee dashboard
    renderAttendeeDashboard();
  } catch (error) {
    console.error('Error loading attendee dashboard:', error);
    alert('Failed to load dashboard. Please refresh.');
  }
}

// ===== 9. CHECK AUTHENTICATION ON LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      appState.user = JSON.parse(storedUser);
      appState.isLoggedIn = true;
      appState.userRole = appState.user.role;
      
      // Navigate to appropriate dashboard
      if (appState.user.role === 'organizer') {
        navigateTo('organizer-dashboard');
      } else {
        navigateTo('attendee-dashboard');
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('user');
    }
  }
});

// ===== 10. LOGOUT FUNCTION =====
function logout() {
  appState.isLoggedIn = false;
  appState.user = null;
  appState.userRole = null;
  localStorage.removeItem('user');
  navigateTo('home');
}

/*
 * USAGE INSTRUCTIONS:
 * 
 * 1. Copy the above functions to replace their counterparts in app.js
 * 2. Make sure api.js is loaded before app.js in index.html
 * 3. Start the backend server: npm run server
 * 4. Start the frontend: npm run client (or open index.html directly via backend)
 * 5. The backend serves both API and static files on port 5000
 * 
 * TESTING:
 * 
 * 1. Go to http://localhost:5000
 * 2. Click "Get Started" and sign up as an organizer
 * 3. Create a new event
 * 4. Use QR scanner to check in attendees
 * 5. View analytics
 * 6. Sign up as attendee and register for events
 * 7. Submit feedback
 */
