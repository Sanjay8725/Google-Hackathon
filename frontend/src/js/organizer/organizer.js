(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.id || user.role !== 'organizer') {
    window.location.href = '../auth.html';
    return;
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
  }

  function showSection(section) {
    const eventsSection = document.getElementById('eventsSection');
    const analyticsSection = document.getElementById('analyticsSection');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (section === 'events') {
      eventsSection.style.display = 'block';
      analyticsSection.style.display = 'none';
    } else {
      eventsSection.style.display = 'none';
      analyticsSection.style.display = 'block';
    }
  }

  async function loadOrganizerEvents() {
    const statsEl = document.getElementById('quickStats');
    const grid = document.getElementById('eventsGrid');

    try {
      const result = await window.api.getOrganizerEvents(user.id);
      const events = result.success ? result.events : [];
      organizerEvents = events;

      const totalAttendees = events.reduce((sum, e) => sum + (e.registered || 0), 0);
      const totalCheckedIn = events.reduce((sum, e) => sum + (e.checked_in || 0), 0);
      const avgEngagement = events.length
        ? Math.round(events.reduce((sum, e) => sum + (e.engagement || 0), 0) / events.length)
        : 0;

      statsEl.innerHTML = `
        <div class="stat-box"><span>📅</span><div><p class="stat-value">${events.length}</p><p class="stat-label">Total Events</p></div></div>
        <div class="stat-box"><span>👥</span><div><p class="stat-value">${totalAttendees}</p><p class="stat-label">Total Registered</p></div></div>
        <div class="stat-box"><span>✅</span><div><p class="stat-value">${totalCheckedIn}</p><p class="stat-label">Checked-In</p></div></div>
        <div class="stat-box"><span>📊</span><div><p class="stat-value">${avgEngagement}%</p><p class="stat-label">Avg Engagement</p></div></div>
      `;

      grid.innerHTML = events.map(event => `
        <div class="event-card">
          <div class="event-header">
            <h3>${event.title}</h3>
            <span class="status-badge ${event.status.toLowerCase()}">${event.status}</span>
          </div>
          <div class="event-details">
            <div class="detail-item"><span>📅 Date:</span> ${event.date}</div>
            <div class="detail-item"><span>📍 Location:</span> ${event.location}</div>
            <div class="detail-item"><span>👥 Registered:</span> ${event.registered || 0}</div>
            <div class="detail-item"><span>✅ Checked In:</span> ${event.checked_in || 0}</div>
            <div class="detail-item"><span>📊 Engagement:</span> ${event.engagement || 0}%</div>
          </div>
          <div class="event-actions">
            <button class="action-btn edit" onclick="viewEventAnalytics(${event.id})">📊 Analytics</button>
            <button class="action-btn preview" onclick="startQRScanner(${event.id})">📱 QR Check-in</button>
          </div>
        </div>
      `).join('');

      if (events.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No events created yet</div></div>';
      }
    } catch (error) {
      console.error('Failed to load organizer events:', error);
      statsEl.innerHTML = '';
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load events</div></div>';
    }
  }

  async function handleRegisterAttendee(event) {
    event.preventDefault();

    const eventId = Number(document.getElementById('regEventId').value);
    const userId = Number(document.getElementById('regUserId').value);
    const ticketType = (document.getElementById('regTicketType').value || 'General').trim();

    if (!eventId || !userId) {
      alert('Please enter Event ID and User ID.');
      return;
    }

    try {
      const result = await window.api.registerForEvent(eventId, userId, ticketType || 'General');
      if (result.success) {
        alert('Attendee registered successfully.');
        document.getElementById('eventRegisterForm').reset();
        document.getElementById('regTicketType').value = 'General';
        loadOrganizerEvents();
      } else {
        alert(result.message || 'Failed to register attendee.');
      }
    } catch (error) {
      console.error('Register attendee error:', error);
      alert('Failed to register attendee.');
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();

    const title = (document.getElementById('newEventTitle').value || '').trim();
    const date = (document.getElementById('newEventDate').value || '').trim();
    const time = (document.getElementById('newEventTime').value || '').trim();
    const location = (document.getElementById('newEventLocation').value || '').trim();
    const category = (document.getElementById('newEventCategory').value || '').trim();
    const description = (document.getElementById('newEventDescription').value || '').trim();

    if (!title || !date || !location || !category) {
      alert('Please provide title, date, location and category.');
      return;
    }

    try {
      const result = await window.api.createEvent({
        organizer_id: user.id,
        title: title,
        description: description,
        date: date,
        time: time,
        location: location,
        category: category,
        capacity: 0
      });

      if (!result || !result.success) {
        alert((result && result.message) || 'Failed to create event.');
        return;
      }

      alert('Event created successfully.');
      document.getElementById('createEventForm').reset();
      loadOrganizerEvents();
    } catch (error) {
      console.error('Create event error:', error);
      alert('Failed to create event.');
    }
  }

  window.logout = logout;
  window.showSection = showSection;
  window.viewEventAnalytics = () => alert('Analytics view coming soon.');
  window.startQRScanner = () => alert('QR scanner coming soon.');

  document.addEventListener('DOMContentLoaded', function () {
    const createEventForm = document.getElementById('createEventForm');
    const form = document.getElementById('eventRegisterForm');
    if (createEventForm) {
      createEventForm.addEventListener('submit', handleCreateEvent);
    }
    if (form) {
      form.addEventListener('submit', handleRegisterAttendee);
    }

    // Mobile hamburger menu
    const orgMenuToggle = document.getElementById('orgMenuToggle');
    const orgOverlay = document.getElementById('orgOverlay');
    const orgSidebar = document.getElementById('orgSidebar');

    if (orgMenuToggle && orgOverlay && orgSidebar) {
      orgMenuToggle.addEventListener('click', function () {
        orgSidebar.classList.toggle('mobile-open');
        orgMenuToggle.classList.toggle('active');
        orgOverlay.classList.toggle('active');
      });
      orgOverlay.addEventListener('click', function () {
        orgSidebar.classList.remove('mobile-open');
        orgMenuToggle.classList.remove('active');
        orgOverlay.classList.remove('active');
      });
      document.addEventListener('click', function (e) {
        if (!orgSidebar.contains(e.target) && !orgMenuToggle.contains(e.target)) {
          if (orgSidebar.classList.contains('mobile-open')) {
            orgSidebar.classList.remove('mobile-open');
            orgMenuToggle.classList.remove('active');
            orgOverlay.classList.remove('active');
          }
        }
      });
    }

    loadOrganizerEvents();
  });
})();
