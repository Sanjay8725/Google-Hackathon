// API Configuration
// Keep API path relative so it works with Vite proxy and backend-served static pages.
const API_BASE_URL = '/api';

// Helper function to wrap fetch calls with error handling
async function apiFetch(url, options = {}) {
  try {
    console.log(`📤 ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      
      // Try to parse error response
      try {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          error: errorData
        };
      } catch (e) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        };
      }
    }
    
    const data = await response.json();
    console.log(`📡 HTTP Status: ${response.status}`, data);
    return data;
  } catch (error) {
    console.error('❌ Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check if server is running at ' + API_BASE_URL,
      error: error.message
    };
  }
}

// API Helper Functions
const api = {
  // Authentication
  async register(userData) {
    return await apiFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async login(credentials) {
    const role = credentials && credentials.role;
    const roleSuffix = role ? `/login/${role}` : '/login';
    return await apiFetch(`${API_BASE_URL}/auth${roleSuffix}`, {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail: credentials.usernameOrEmail, password: credentials.password })
    });
  },

  async getProfile(userId) {
    return await apiFetch(`${API_BASE_URL}/auth/profile/${userId}`);
  },

  // Attendee Module APIs
  async getMySchedule(userId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/schedule`);
  },

  async getEventDetails(userId, eventId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/event/${eventId}`);
  },

  async getQRCode(userId, eventId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/qrcode/${eventId}`);
  },

  async getMyFeedback(userId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/feedback`);
  },

  async submitFeedbackToEvent(userId, eventId, rating, comment) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/feedback/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    });
  },

  async getNotifications(userId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/notifications`);
  },

  async getCertificate(userId, eventId) {
    return await apiFetch(`${API_BASE_URL}/attendee/${userId}/certificate/${eventId}`);
  },

  // Events
  async getAllEvents() {
    return await apiFetch(`${API_BASE_URL}/events`);
  },

  async getEventById(eventId) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}`);
  },

  async createEvent(eventData) {
    return await apiFetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(eventId, updates) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteEvent(eventId) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE'
    });
  },

  async getOrganizerEvents(organizerId) {
    return await apiFetch(`${API_BASE_URL}/events/organizer/${organizerId}`);
  },

  async registerForEvent(eventId, userId, ticketType = 'General') {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ticket_type: ticketType })
    });
  },

  async getEventRegistrations(eventId) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}/registrations`);
  },

  async getEventExpenses(eventId) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}/expenses`);
  },

  async addEventExpense(eventId, expenseData) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  },

  async deleteEventExpense(eventId, expenseId, organizerId) {
    return await apiFetch(`${API_BASE_URL}/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE',
      body: JSON.stringify({ organizer_id: organizerId })
    });
  },

  // Attendance
  async checkIn(checkInData) {
    return await apiFetch(`${API_BASE_URL}/attendance/checkin`, {
      method: 'POST',
      body: JSON.stringify(checkInData)
    });
  },

  async getEventAttendance(eventId) {
    return await apiFetch(`${API_BASE_URL}/attendance/event/${eventId}`);
  },

  async getUserAttendance(userId) {
    return await apiFetch(`${API_BASE_URL}/attendance/user/${userId}`);
  },

  async simulateQRScan(qrCode) {
    return await apiFetch(`${API_BASE_URL}/attendance/qr-scan`, {
      method: 'POST',
      body: JSON.stringify({ qr_code: qrCode })
    });
  },

  // Feedback
  async submitFeedback(feedbackData) {
    return await apiFetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  },

  async getEventFeedback(eventId) {
    return await apiFetch(`${API_BASE_URL}/feedback/event/${eventId}`);
  },

  async getFeedbackStats(eventId) {
    return await apiFetch(`${API_BASE_URL}/feedback/stats/${eventId}`);
  },

  // Analytics
  async getEventAnalytics(eventId) {
    return await apiFetch(`${API_BASE_URL}/analytics/event/${eventId}`);
  },

  async getDashboardAnalytics(organizerId) {
    return await apiFetch(`${API_BASE_URL}/analytics/dashboard/${organizerId}`);
  },

  async trackEngagement(engagementData) {
    return await apiFetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      body: JSON.stringify(engagementData)
    });
  },

  // Admin APIs
  async getAdminDashboard() {
    return await apiFetch(`${API_BASE_URL}/admin/dashboard`);
  },

  async getAllUsersAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`${API_BASE_URL}/admin/users?${queryString}`);
  },

  async getOrganizersAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`${API_BASE_URL}/admin/organizers?${queryString}`);
  },

  async updateOrganizerStatusAdmin(organizerId, status) {
    return await apiFetch(`${API_BASE_URL}/admin/organizers/${organizerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async updateUserAdmin(userId, updates) {
    return await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteUserAdmin(userId) {
    return await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async getAllEventsAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`${API_BASE_URL}/admin/events?${queryString}`);
  },

  async approveEventAdmin(eventId) {
    return await apiFetch(`${API_BASE_URL}/admin/events/${eventId}/approve`, {
      method: 'PUT'
    });
  },

  async updateEventAdmin(eventId, updates) {
    return await apiFetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteEventAdmin(eventId) {
    return await apiFetch(`${API_BASE_URL}/admin/events/${eventId}`, {
      method: 'DELETE'
    });
  },

  async getSystemAnalytics() {
    return await apiFetch(`${API_BASE_URL}/admin/analytics`);
  },

  async getRegistrationsAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`${API_BASE_URL}/admin/registrations?${queryString}`);
  },

  async exportRegistrationsAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/admin/registrations/export?${queryString}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const csv = await response.text();
      return { success: true, csv };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to export registrations',
        error: error.message
      };
    }
  },

  async generateReport(type, startDate, endDate) {
    const params = new URLSearchParams({ type, startDate, endDate }).toString();
    return await apiFetch(`${API_BASE_URL}/admin/reports?${params}`);
  },

  async createAnnouncement(data) {
    return await apiFetch(`${API_BASE_URL}/admin/announcements`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getFeedbackAdmin(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`${API_BASE_URL}/admin/feedback?${queryString}`);
  },

  async getAdminSettings() {
    return await apiFetch(`${API_BASE_URL}/admin/settings`);
  },

  async updateAdminSettings(settings) {
    return await apiFetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async getActivityLogs(limit = 100, offset = 0) {
    return await apiFetch(`${API_BASE_URL}/admin/logs?limit=${limit}&offset=${offset}`);
  },

  // Legacy helpers for plain JS admin portal (frontend/src/js/admin/admin.js)
  async getUsers(params = {}) {
    return await this.getAllUsersAdmin(params);
  },

  async addUser(data) {
    return await apiFetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminEvents(params = {}) {
    return await this.getAllEventsAdmin(params);
  },

  async addEvent(data) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const organizerId = data.organizer_id || storedUser.id;
    const category = String(data.category || '').trim();

    if (!category) {
      return {
        success: false,
        message: 'Event category is required'
      };
    }

    return await apiFetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      body: JSON.stringify({
        organizer_id: organizerId,
        title: data.title,
        description: data.description || '',
        date: data.date,
        time: data.time || '',
        location: data.location || '',
        capacity: Number(data.capacity || 0),
        category: category
      })
    });
  }
};

// Export for use in app.js
window.api = api;
