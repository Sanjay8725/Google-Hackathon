(function () {
  let currentFilter = 'all';
  let currentSearch = '';
  let currentSort = 'date-asc';
  let allEvents = [];
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const statusPriority = { Live: 0, Upcoming: 1, Completed: 2 };
  const EDUCATIONAL_KEYS = new Set([
    'educational',
    'workshop',
    'workshops',
    'seminar',
    'seminars',
    'training',
    'training program',
    'training programs',
    'hackathon',
    'hackathons',
    'academic conference',
    'academic conferences'
  ]);

  if (!user.id) {
    window.location.href = '../auth.html';
    return;
  }

  function goBack() {
    window.location.href = 'attendee-dashboard.html';
  }

  async function loadSchedule() {
    try {
      const result = await window.api.getMySchedule(user.id);
      if (result.success) {
        allEvents = result.schedule;
        renderSummary();
        displaySchedule(currentFilter);
      } else {
        renderSummary();
        showEmpty();
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      renderSummary();
      showEmpty('Error loading schedule. Please refresh the page.');
    }
  }

  function normalizeStatus(status) {
    const value = String(status || 'Upcoming').toLowerCase();
    if (value === 'live') return 'Live';
    if (value === 'completed') return 'Completed';
    return 'Upcoming';
  }

  function getEventDateTime(event) {
    const raw = `${event.date || ''} ${event.time || '00:00:00'}`.trim();
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    return new Date(event.date || Date.now());
  }

  function formatEventDate(event) {
    return getEventDateTime(event).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatRelativeTime(dateValue) {
    const now = new Date();
    const diff = dateValue.getTime() - now.getTime();
    const absMinutes = Math.round(Math.abs(diff) / 60000);

    if (absMinutes < 60) {
      if (absMinutes < 2) {
        return diff >= 0 ? 'starting now' : 'started just now';
      }
      return diff >= 0 ? `in ${absMinutes} mins` : `${absMinutes} mins ago`;
    }

    const absHours = Math.round(absMinutes / 60);
    if (absHours < 48) {
      return diff >= 0 ? `in ${absHours} hrs` : `${absHours} hrs ago`;
    }

    const absDays = Math.round(absHours / 24);
    return diff >= 0 ? `in ${absDays} days` : `${absDays} days ago`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isEducationalEvent(eventItem) {
    const category = String(eventItem.category || '').trim().toLowerCase();
    const subCategory = String(eventItem.sub_category || '').trim().toLowerCase();
    return EDUCATIONAL_KEYS.has(category) || EDUCATIONAL_KEYS.has(subCategory);
  }

  function canShowCertificate(eventItem) {
    return normalizeStatus(eventItem.status) === 'Completed' && Boolean(eventItem.checked_in_status) && isEducationalEvent(eventItem);
  }

  function getVisibleEvents() {
    const search = currentSearch.trim().toLowerCase();
    let filtered = allEvents.filter((eventItem) => {
      const status = normalizeStatus(eventItem.status);
      if (currentFilter !== 'all' && status !== currentFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        eventItem.title,
        eventItem.location,
        eventItem.organizer_name,
        eventItem.status
      ].join(' ').toLowerCase();

      return haystack.includes(search);
    });

    filtered.sort((left, right) => {
      if (currentSort === 'title-asc') {
        return String(left.title || '').localeCompare(String(right.title || ''));
      }

      if (currentSort === 'status') {
        const byStatus = (statusPriority[normalizeStatus(left.status)] ?? 99) - (statusPriority[normalizeStatus(right.status)] ?? 99);
        if (byStatus !== 0) {
          return byStatus;
        }
      }

      const leftDate = getEventDateTime(left).getTime();
      const rightDate = getEventDateTime(right).getTime();

      if (currentSort === 'date-desc') {
        return rightDate - leftDate;
      }

      return leftDate - rightDate;
    });

    return filtered;
  }

  function renderSummary() {
    const summaryRoot = document.getElementById('scheduleSummary');
    if (!summaryRoot) {
      return;
    }

    const counts = allEvents.reduce((accumulator, eventItem) => {
      const status = normalizeStatus(eventItem.status);
      accumulator.total += 1;
      accumulator[status.toLowerCase()] += 1;
      if (eventItem.checked_in_status) {
        accumulator.checkedIn += 1;
      }
      return accumulator;
    }, { total: 0, live: 0, upcoming: 0, completed: 0, checkedIn: 0 });

    const cards = [
      { label: 'Registered Events', value: counts.total, tone: 'warm' },
      { label: 'Live Right Now', value: counts.live, tone: 'danger' },
      { label: 'Upcoming', value: counts.upcoming, tone: 'teal' },
      { label: 'Checked In', value: counts.checkedIn, tone: 'gold' }
    ];

    summaryRoot.innerHTML = cards.map((card) => `
      <article class="summary-card tone-${card.tone}">
        <span class="summary-label">${card.label}</span>
        <strong class="summary-value">${card.value}</strong>
      </article>
    `).join('');
  }

  function renderExtendedContent(visibleEvents) {
    const spotlightRoot = document.getElementById('nextEventSpotlight');
    const timelineRoot = document.getElementById('agendaTimeline');
    const prepRoot = document.getElementById('prepChecklist');

    if (!spotlightRoot || !timelineRoot || !prepRoot) {
      return;
    }

    const sortedEvents = [...allEvents].sort((a, b) => getEventDateTime(a) - getEventDateTime(b));
    const nextEvent = sortedEvents.find((eventItem) => {
      const status = normalizeStatus(eventItem.status);
      if (status === 'Live') {
        return true;
      }
      return getEventDateTime(eventItem).getTime() >= Date.now();
    });

    if (nextEvent) {
      const status = normalizeStatus(nextEvent.status);
      const eventDateTime = getEventDateTime(nextEvent);
      spotlightRoot.innerHTML = `
        <p class="extended-kicker">Next Up</p>
        <h3>${escapeHtml(nextEvent.title)}</h3>
        <p class="extended-copy">${escapeHtml(nextEvent.description || 'Your next important event is lined up. Keep your QR and travel timing ready.')}</p>
        <div class="spotlight-meta">
          <span class="spotlight-pill ${status.toLowerCase()}">${status}</span>
          <span>${escapeHtml(formatEventDate(nextEvent))} · ${escapeHtml(nextEvent.time || 'TBA')}</span>
          <span>${escapeHtml(nextEvent.location || 'Venue TBA')} · ${escapeHtml(formatRelativeTime(eventDateTime))}</span>
        </div>
      `;
    } else {
      spotlightRoot.innerHTML = `
        <p class="extended-kicker">Next Up</p>
        <h3>No upcoming events</h3>
        <p class="extended-copy">You are all caught up. Explore events to add more sessions to your schedule.</p>
      `;
    }

    const timelineEvents = (visibleEvents.length ? visibleEvents : sortedEvents).slice(0, 5);
    if (!timelineEvents.length) {
      timelineRoot.innerHTML = '<p class="agenda-empty">Timeline will appear when your schedule is loaded.</p>';
    } else {
      timelineRoot.innerHTML = timelineEvents.map((eventItem) => {
        const status = normalizeStatus(eventItem.status);
        return `
          <div class="timeline-item">
            <div class="timeline-dot ${status.toLowerCase()}"></div>
            <div class="timeline-content">
              <p class="timeline-title">${escapeHtml(eventItem.title)}</p>
              <p class="timeline-meta">${escapeHtml(formatEventDate(eventItem))} · ${escapeHtml(eventItem.time || 'TBA')}</p>
              <p class="timeline-sub">${escapeHtml(eventItem.location || 'Venue TBA')} · ${escapeHtml(status)}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    const hasLive = allEvents.some((eventItem) => normalizeStatus(eventItem.status) === 'Live');
    const hasCompleted = allEvents.some((eventItem) => normalizeStatus(eventItem.status) === 'Completed');
    const checklist = [
      'Keep your QR code ready before reaching the venue.',
      'Arrive 15 minutes early for smooth check-in.',
      hasLive ? 'A live session is active now. Keep notifications enabled for updates.' : 'No live session now. You can use this time to review upcoming talks.',
      hasCompleted ? 'Educational completed events can unlock certificates after attendance is verified.' : 'Certificates unlock only for completed educational events with attendance.'
    ];

    prepRoot.innerHTML = checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function displaySchedule(filter) {
    currentFilter = filter;
    syncActiveFilterButton();
    const filtered = getVisibleEvents();
    renderExtendedContent(filtered);

    if (filtered.length === 0) {
      const label = filter === 'all' ? 'events' : `${filter.toLowerCase()} events`;
      showEmpty(`No ${label} found for the current view.`);
      return;
    }

    const html = filtered.map(event => `
      <article class="schedule-card">
        <div class="schedule-card-top">
          <span class="schedule-card-status ${normalizeStatus(event.status).toLowerCase()}">${normalizeStatus(event.status)}</span>
          ${event.checked_in_status ? '<span class="check-in-badge">Checked In</span>' : ''}
        </div>

        <h3>${escapeHtml(event.title)}</h3>
        <p class="schedule-card-description">${escapeHtml(event.description || 'Your event access, time slot, and attendance details are ready here.')}</p>

        <div class="schedule-card-meta-grid">
          <div class="meta-chip">
            <span class="meta-label">Date</span>
            <strong>${escapeHtml(formatEventDate(event))}</strong>
          </div>
          <div class="meta-chip">
            <span class="meta-label">Time</span>
            <strong>${escapeHtml(event.time || 'TBA')}</strong>
          </div>
          <div class="meta-chip">
            <span class="meta-label">Location</span>
            <strong>${escapeHtml(event.location || 'Venue TBA')}</strong>
          </div>
          <div class="meta-chip">
            <span class="meta-label">Organizer</span>
            <strong>${escapeHtml(event.organizer_name || 'Event Team')}</strong>
          </div>
        </div>

        <div class="schedule-insights">
          <div class="insight-row">
            <span>Registered</span>
            <strong>${event.registered}</strong>
          </div>
          <div class="insight-row">
            <span>Checked In</span>
            <strong>${event.checked_in}</strong>
          </div>
        </div>

        <div class="schedule-card-actions">
          <button class="schedule-card-btn schedule-card-btn-secondary" onclick="viewDetails(${event.id})">📋 Details</button>
          <button class="schedule-card-btn schedule-card-btn-primary" onclick="goToQR(${event.id})">🎟️ QR Code</button>
        </div>
      </article>
    `).join('');

    document.getElementById('scheduleContent').innerHTML = html;
  }

  function filterSchedule(filter) {
    displaySchedule(filter);
  }

  function syncActiveFilterButton() {
    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === currentFilter || (currentFilter === 'all' && button.dataset.filter === 'all'));
    });
  }

  function showEmpty(message = 'No events registered') {
    document.getElementById('scheduleContent').innerHTML = `
      <section class="schedule-empty">
        <div class="schedule-empty-icon">📅</div>
        <div class="schedule-empty-text">${escapeHtml(message)}</div>
        <div class="schedule-empty-subtext">Browse and register for events to build your personal plan.</div>
        <button class="schedule-card-btn schedule-card-btn-primary schedule-empty-btn" onclick="window.location.href='../index.html'">🎯 Browse Events</button>
      </section>
    `;
  }

  function viewDetails(eventId) {
    const eventItem = allEvents.find((entry) => Number(entry.id) === Number(eventId));
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('eventModalBody');

    if (!eventItem || !modal || !modalBody) {
      return;
    }

    const status = normalizeStatus(eventItem.status);
    modalBody.innerHTML = `
      <div class="modal-status-row">
        <span class="schedule-card-status ${status.toLowerCase()}">${status}</span>
        ${eventItem.checked_in_status ? '<span class="check-in-badge">Checked In</span>' : ''}
      </div>
      <h3 id="eventModalTitle" class="schedule-modal-title">${escapeHtml(eventItem.title)}</h3>
      <p class="schedule-modal-copy">${escapeHtml(eventItem.description || 'Your event schedule details are available here. Use the QR button to access entry and submit feedback after participation.')}</p>
      <div class="schedule-card-meta-grid modal-meta-grid">
        <div class="meta-chip">
          <span class="meta-label">Date</span>
          <strong>${escapeHtml(formatEventDate(eventItem))}</strong>
        </div>
        <div class="meta-chip">
          <span class="meta-label">Time</span>
          <strong>${escapeHtml(eventItem.time || 'TBA')}</strong>
        </div>
        <div class="meta-chip">
          <span class="meta-label">Location</span>
          <strong>${escapeHtml(eventItem.location || 'Venue TBA')}</strong>
        </div>
        <div class="meta-chip">
          <span class="meta-label">Organizer</span>
          <strong>${escapeHtml(eventItem.organizer_name || 'Event Team')}</strong>
        </div>
      </div>
      <div class="schedule-insights">
        <div class="insight-row">
          <span>Registered</span>
          <strong>${eventItem.registered}</strong>
        </div>
        <div class="insight-row">
          <span>Checked In</span>
          <strong>${eventItem.checked_in}</strong>
        </div>
      </div>
      ${canShowCertificate(eventItem) ? `<div class="schedule-card-actions" style="margin-top: 16px;"><button class="schedule-card-btn schedule-card-btn-primary" onclick="goToCertificate(${eventItem.id})">🏆 Download Certificate</button></div>` : ''}
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (!modal) {
      return;
    }

    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function goToQR(eventId) {
    window.location.href = `qrcode.html?eventId=${eventId}`;
  }

  function goToCertificate(eventId) {
    window.location.href = `certificate.html?eventId=${eventId}`;
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
  }

  function bindControls() {
    const searchInput = document.getElementById('scheduleSearch');
    const sortSelect = document.getElementById('scheduleSort');

    if (searchInput) {
      searchInput.addEventListener('input', (inputEvent) => {
        currentSearch = inputEvent.target.value;
        displaySchedule(currentFilter);
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (changeEvent) => {
        currentSort = changeEvent.target.value;
        displaySchedule(currentFilter);
      });
    }

    document.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        closeEventModal();
      }
    });
  }

  window.goBack = goBack;
  window.filterSchedule = filterSchedule;
  window.viewDetails = viewDetails;
  window.closeEventModal = closeEventModal;
  window.logout = logout;

  document.addEventListener('DOMContentLoaded', () => {
    bindControls();
    loadSchedule();
  });
})();
