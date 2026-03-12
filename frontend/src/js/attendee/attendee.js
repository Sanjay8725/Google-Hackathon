(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.id || user.role !== 'attendee') {
    window.location.href = '../auth.html';
    return;
  }

  // ── State ──
  let allEvents = [];
  let notifications = [];
  let currentFeedbackEventId = null;
  let currentFeedbackEventTitle = '';
  let currentRating = 5;
  let tabsLoaded = {};

  // ── Utility ──
  function escapeHtml(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function normalizeStatus(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'live') return 'Live';
    if (v === 'completed') return 'Completed';
    return 'Upcoming';
  }

  function statusClass(status) {
    const s = normalizeStatus(status);
    if (s === 'Live') return 'live';
    if (s === 'Completed') return 'completed';
    return 'upcoming';
  }

  function getFeedbackEligibleEvents() {
    return allEvents.filter(event => normalizeStatus(event.status) === 'Completed' && event.checked_in_status);
  }

  function logout() {
    localStorage.clear();
    window.location.href = '../auth.html';
  }

  // ── Tab Switching ──
  // ── Page labels for header title (mobile) ──
  const PAGE_LABELS = {
    'dashboard':     'Dashboard',
    'my-events':     'My Events',
    'my-schedule':   'My Schedule',
    'tickets':       'Tickets / QR',
    'feedback':      'Event Feedback',
    'notifications': 'Notifications'
  };

  // ── Page Switching ──
  function switchPage(pageName) {
    // Highlight active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageName);
    });
    // Show / hide page sections
    document.querySelectorAll('.portal-page').forEach(sec => {
      const isActive = sec.id === 'page-' + pageName;
      sec.classList.toggle('hidden', !isActive);
      sec.classList.toggle('active-page', isActive);
    });
    // Update mobile header page title
    const titleEl = document.getElementById('headerPageTitle');
    if (titleEl) titleEl.textContent = PAGE_LABELS[pageName] || '';
    // Close dropdown and mobile sidebar
    closeNotifDropdown();
    closeSidebar();
    // Lazy-load page content once
    if (!tabsLoaded[pageName]) {
      tabsLoaded[pageName] = true;
      loadPageContent(pageName);
    }
  }

  // Backward-compat alias used by the notification dropdown
  function switchTab(pageName) { switchPage(pageName); }

  function loadPageContent(pageName) {
    if (pageName === 'my-events')     renderMyEvents();
    if (pageName === 'my-schedule')   renderMySchedule();
    if (pageName === 'tickets')       renderTickets();
    if (pageName === 'feedback')      renderFeedbackTab();
    if (pageName === 'notifications') renderNotificationsPage();
  }

  // ── Sidebar toggle (mobile) ──
  function toggleSidebar() {
    const sidebar = document.getElementById('portalSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    const open = sidebar.classList.toggle('sidebar-open');
    if (overlay) overlay.classList.toggle('hidden', !open);
  }

  function closeSidebar() {
    const sidebar = document.getElementById('portalSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('sidebar-open');
    if (overlay) overlay.classList.add('hidden');
  }

  // ── Load Events ──
  async function loadAllEvents() {
    try {
      const result = await window.api.getMySchedule(user.id);
      allEvents = (result.success && result.schedule) ? result.schedule : [];
    } catch (e) {
      console.error('Failed to load events:', e);
      allEvents = [];
    }
  }

  // ── Dashboard ──
  function renderDashboard() {
    const liveEvents = allEvents.filter(e => normalizeStatus(e.status) === 'Live');
    const upcoming = allEvents.filter(e => normalizeStatus(e.status) === 'Upcoming').slice(0, 4);
    const completed = allEvents.filter(e => normalizeStatus(e.status) === 'Completed');

    // Set greeting
    const wn = document.getElementById('welcomeName');
    if (wn) wn.textContent = user.name || 'Attendee';

    // Stats
    const statsEl = document.getElementById('dashboardStats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${allEvents.length}</div>
          <div class="stat-label">Registered Events</div>
        </div>
        <div class="stat-card stat-live">
          <div class="stat-value">${liveEvents.length}</div>
          <div class="stat-label">🔴 Live Now</div>
        </div>
        <div class="stat-card stat-upcoming">
          <div class="stat-value">${upcoming.length}</div>
          <div class="stat-label">Upcoming</div>
        </div>
        <div class="stat-card stat-completed">
          <div class="stat-value">${completed.length}</div>
          <div class="stat-label">Completed</div>
        </div>
      `;
    }

    // Live sessions on dashboard
    const livEl = document.getElementById('dashLiveSessions');
    if (livEl) {
      livEl.innerHTML = liveEvents.length
        ? liveEvents.map(e => buildLiveSessionCard(e)).join('')
        : '<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-text">No live sessions right now.</div></div>';
    }

    // Upcoming events on dashboard
    const upEl = document.getElementById('dashUpcoming');
    if (upEl) {
      upEl.innerHTML = upcoming.length
        ? upcoming.map(e => buildEventCard(e)).join('')
        : '<div class="empty-state"><div class="empty-state-icon">🗓️</div><div class="empty-state-text">No upcoming events.</div></div>';
    }
  }

  // ── Live Session Card ──
  function buildLiveSessionCard(event) {
    return `
      <div class="live-session-card">
        <div class="live-pulse-icon">🔴</div>
        <div class="live-session-body">
          <h4 class="live-session-title">${escapeHtml(event.title)}</h4>
          <p class="live-session-speaker">🎤 ${escapeHtml(event.organizer_name || 'Event Organizer')}</p>
          <div class="live-session-meta">
            <span>📍 ${escapeHtml(event.location || 'Main Venue')}</span>
            <span>🕐 ${escapeHtml(event.time || 'Live Now')}</span>
          </div>
        </div>
        <button class="btn-live-qr" onclick="openQrForEvent(${event.id})">🎟️ QR Pass</button>
      </div>
    `;
  }

  // ── Generic Event Card ──
  function buildEventCard(event) {
    const status = normalizeStatus(event.status);
    return `
      <div class="event-card">
        <div class="event-card-top">
          <span class="event-status-badge ${statusClass(event.status)}">${escapeHtml(status)}</span>
          ${event.checked_in_status ? '<span class="check-in-badge">✓ Checked In</span>' : ''}
        </div>
        <h4 class="event-card-title">${escapeHtml(event.title)}</h4>
        <div class="event-card-meta">
          <span>📅 ${escapeHtml(formatDate(event.date))}</span>
          <span>🕐 ${escapeHtml(event.time || 'TBA')}</span>
          <span>📍 ${escapeHtml(event.location || 'TBA')}</span>
          <span>👤 ${escapeHtml(event.organizer_name || 'Organizer')}</span>
        </div>
      </div>
    `;
  }

  // ── My Events Tab ──
  function renderMyEvents() {
    const el = document.getElementById('myEventsGrid');
    if (!el) return;
    if (allEvents.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No registered events yet.</div></div>';
      return;
    }
    el.innerHTML = allEvents.map(e => buildEventCard(e)).join('');
  }

  // ── My Schedule Tab ──
  function renderMySchedule() {
    const liveEvents = allEvents.filter(e => normalizeStatus(e.status) === 'Live');

    // Live panel
    const livEl = document.getElementById('schedLiveSessions');
    const livePanel = document.getElementById('livePanel');
    if (livEl) {
      if (liveEvents.length === 0) {
        livEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-text">No live sessions right now. Check back during the event.</div></div>';
        if (livePanel) livePanel.classList.add('live-panel-quiet');
      } else {
        livEl.innerHTML = liveEvents.map(e => buildLiveSessionCard(e)).join('');
      }
    }

    // Timeline of all events
    const timelineEl = document.getElementById('scheduleTimeline');
    if (!timelineEl) return;
    if (allEvents.length === 0) {
      timelineEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No events in your schedule.</div></div>';
      return;
    }

    const sorted = [...allEvents].sort((a, b) => {
      const dt = ev => {
        const d = new Date(`${ev.date || ''} ${ev.time || '00:00:00'}`);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return dt(a) - dt(b);
    });

    timelineEl.innerHTML = sorted.map(event => {
      const status = normalizeStatus(event.status);
      return `
        <div class="timeline-row">
          <div class="timeline-dot ${statusClass(event.status)}"></div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <h4>${escapeHtml(event.title)}</h4>
              <span class="event-status-badge ${statusClass(event.status)}">${escapeHtml(status)}</span>
            </div>
            <div class="timeline-card-meta">
              <span>📅 ${escapeHtml(formatDate(event.date))}</span>
              <span>🕐 ${escapeHtml(event.time || 'TBA')}</span>
              <span>📍 ${escapeHtml(event.location || 'TBA')}</span>
              <span>🎤 ${escapeHtml(event.organizer_name || 'Organizer')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Tickets / QR Tab ──
  function renderTickets() {
    const el = document.getElementById('ticketsGrid');
    if (!el) return;
    if (allEvents.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎟️</div><div class="empty-state-text">No registered events.</div></div>';
      return;
    }
    el.innerHTML = allEvents.map(event => `
      <div class="event-card ticket-card" onclick="openQrForEvent(${event.id})" role="button" tabindex="0">
        <div class="event-card-top">
          <span class="event-status-badge ${statusClass(event.status)}">${escapeHtml(normalizeStatus(event.status))}</span>
        </div>
        <h4 class="event-card-title">${escapeHtml(event.title)}</h4>
        <div class="event-card-meta">
          <span>📅 ${escapeHtml(formatDate(event.date))}</span>
          <span>📍 ${escapeHtml(event.location || 'TBA')}</span>
        </div>
        <div class="ticket-cta">🎟️ View QR Pass &rarr;</div>
      </div>
    `).join('');
  }

  async function openQrForEvent(eventId) {
    // Switch to tickets page and show QR panel
    switchPage('tickets');
    tabsLoaded['tickets'] = true;
    const grid = document.getElementById('ticketsGrid');
    const panel = document.getElementById('qrViewPanel');
    const content = document.getElementById('qrPanelContent');
    if (!panel || !content) return;
    if (grid) grid.classList.add('hidden');
    panel.classList.remove('hidden');
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const result = await window.api.getQRCode(user.id, eventId);
      if (result.success) {
        content.innerHTML = `
          <div class="qr-display-card">
            <h3>🎟️ ${escapeHtml(result.event_title || 'Your Event')}</h3>
            <p class="qr-event-date">📅 ${escapeHtml(result.event_date || '')}</p>
            <p class="qr-attendee-name">👤 ${escapeHtml(result.attendee_name || user.name || 'Attendee')}</p>
            <div class="qr-code-box">
              ${result.qr_code
                ? `<div class="qr-visual">${escapeHtml(result.qr_code)}</div><p class="qr-label">QR Code</p>`
                : '<div class="qr-visual">📱</div><p class="qr-label">QR code will appear here</p>'}
            </div>
            <p class="qr-note">Show this QR code at the event entrance for check-in.</p>
          </div>
        `;
      } else {
        content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">${escapeHtml(result.message || 'QR code not available')}</div></div>`;
      }
    } catch (e) {
      content.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load QR code.</div></div>';
    }
  }

  function closeQrPanel() {
    const grid = document.getElementById('ticketsGrid');
    const panel = document.getElementById('qrViewPanel');
    if (panel) panel.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
  }

  // ── Event Feedback Tab ──
  async function renderFeedbackTab() {
    const el = document.getElementById('feedbackEventCards');
    if (!el) return;
    const eligibleEvents = getFeedbackEligibleEvents();
    if (eligibleEvents.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">Feedback becomes available after you attend a completed event.</div></div>';
      return;
    }

    // Load existing feedback
    let feedbackMap = {};
    try {
      const fb = await window.api.getMyFeedback(user.id);
      if (fb.success && fb.feedback) {
        fb.feedback.forEach(f => { if (f.event_id) feedbackMap[f.event_id] = f; });
      }
    } catch (e) {
      // Proceed without feedback history
    }

    el.innerHTML = eligibleEvents.map(event => {
      const existing = feedbackMap[event.id];
      const hasFb = Boolean(existing && existing.rating);
      const stars = hasFb
        ? '★'.repeat(existing.rating) + '☆'.repeat(5 - existing.rating)
        : '';
      const submittedDate = (hasFb && existing.created_at)
        ? new Date(existing.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
      return `
        <div class="feedback-event-card">
          <div class="feedback-ec-header">
            <h4>${escapeHtml(event.title)}</h4>
            <span class="event-status-badge ${statusClass(event.status)}">${escapeHtml(normalizeStatus(event.status))}</span>
          </div>
          <div class="feedback-ec-meta">
            <span>📅 ${escapeHtml(formatDate(event.date))}</span>
            <span>📍 ${escapeHtml(event.location || 'TBA')}</span>
          </div>
          ${hasFb ? `
            <div class="feedback-submitted-block">
              <div class="feedback-stars-display">${escapeHtml(stars)}</div>
              <div class="feedback-comment-preview">&ldquo;${escapeHtml((existing.comment || '').slice(0, 100))}${(existing.comment || '').length > 100 ? '&hellip;' : ''}&rdquo;</div>
              <div class="feedback-submitted-date">Submitted: ${escapeHtml(submittedDate)}</div>
            </div>
          ` : '<div class="feedback-no-entry">No feedback submitted yet.</div>'}
          <button type="button" class="btn-open-feedback"
            onclick="openFeedbackForm(${event.id}, '${escapeHtml(event.title)}', ${hasFb ? existing.rating : 5}, '${escapeHtml((hasFb ? existing.comment : '') || '')}')"
          >${hasFb ? '✏️ Edit Feedback' : '💬 Submit Feedback'}</button>
        </div>
      `;
    }).join('');
  }

  function openFeedbackForm(eventId, eventTitle, rating, comment) {
    currentFeedbackEventId = eventId;
    currentFeedbackEventTitle = eventTitle;
    currentRating = rating || 5;
    const cards = document.getElementById('feedbackEventCards');
    const form = document.getElementById('feedbackInlineForm');
    if (cards) cards.classList.add('hidden');
    if (form) form.classList.remove('hidden');
    const titleEl = document.getElementById('fbFormTitle');
    const metaEl = document.getElementById('fbEventMeta');
    const commentEl = document.getElementById('fbComment');
    if (titleEl) titleEl.textContent = `Feedback for "${eventTitle}"`;
    if (metaEl) metaEl.textContent = `Event: ${eventTitle}`;
    if (commentEl) commentEl.value = comment || '';
    setRating(currentRating);
  }

  function closeFeedbackForm() {
    const cards = document.getElementById('feedbackEventCards');
    const form = document.getElementById('feedbackInlineForm');
    if (form) form.classList.add('hidden');
    if (cards) cards.classList.remove('hidden');
    // Reload feedback cards
    tabsLoaded['feedback'] = false;
    renderFeedbackTab();
  }

  function setRating(value) {
    currentRating = value;
    document.querySelectorAll('#starRow .star').forEach(star => {
      star.classList.toggle('active', Number(star.dataset.v) <= value);
    });
    const ratingText = document.getElementById('ratingText');
    if (ratingText) ratingText.textContent = `${value} / 5 stars`;
  }

  async function submitInlineFeedback() {
    if (!currentFeedbackEventId) return;
    const commentEl = document.getElementById('fbComment');
    const comment = commentEl ? commentEl.value.trim() : '';
    const btn = document.getElementById('fbSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
    try {
      const result = await window.api.submitFeedbackToEvent(
        user.id, currentFeedbackEventId, currentRating, comment
      );
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Feedback'; }
      if (result.success) {
        alert('Feedback submitted successfully!');
        closeFeedbackForm();
      } else {
        alert(result.message || 'Failed to submit feedback.');
      }
    } catch (e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Feedback'; }
      alert('Failed to submit feedback. Please try again.');
    }
  }

  // ── Notifications ──
  async function loadNotifications() {
    try {
      const result = await window.api.getNotifications(user.id);
      notifications = (result.success && result.notifications) ? result.notifications : [];
    } catch (e) {
      console.error('Failed to load notifications:', e);
      notifications = [];
    }
    updateNotifBadge();
  }

  function updateNotifBadge() {
    const unread = notifications.filter(n => !n.is_read).length;
    const bellCount = document.getElementById('notifBellCount');
    const tabCount  = document.getElementById('tabNotifCount');
    const sidebarBadge = document.getElementById('sidebarNotifBadge');
    if (unread > 0) {
      if (bellCount)    { bellCount.textContent = unread; bellCount.classList.remove('hidden'); }
      if (tabCount)     { tabCount.textContent  = unread; tabCount.classList.remove('hidden'); }
      if (sidebarBadge) { sidebarBadge.textContent = unread; sidebarBadge.classList.remove('hidden'); }
    } else {
      if (bellCount)    bellCount.classList.add('hidden');
      if (tabCount)     tabCount.classList.add('hidden');
      if (sidebarBadge) sidebarBadge.classList.add('hidden');
    }
  }

  function getNotifIcon(type) {
    const icons = {
      registration_confirmation: '✅',
      live_now: '🔴',
      event_reminder: '⏰',
      feedback_reminder: '💬',
      schedule_update: '📋',
      announcement: '📢'
    };
    return icons[type] || '🔔';
  }

  function buildNotifItem(notif) {
    const timeStr = notif.timestamp
      ? new Date(notif.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
    const actionHtml = getNotifActionMarkup(notif);
    return `
      <div class="notif-item ${notif.is_read ? 'read' : 'unread'}">
        <div class="notif-item-icon">${getNotifIcon(notif.type)}</div>
        <div class="notif-item-body">
          <div class="notif-item-title">${escapeHtml(notif.title)}</div>
          <div class="notif-item-message">${escapeHtml(notif.message)}</div>
          ${timeStr ? `<div class="notif-item-time">${escapeHtml(timeStr)}</div>` : ''}
          ${actionHtml}
        </div>
        ${!notif.is_read ? '<span class="notif-unread-dot"></span>' : ''}
      </div>
    `;
  }

  function getNotifActionMarkup(notif) {
    if (!notif || !notif.event_id) return '';
    const eventId = Number(notif.event_id);
    if (!Number.isFinite(eventId)) return '';

    if (notif.type === 'live_now' || notif.type === 'event_reminder') {
      return `<div class="notif-item-actions"><button type="button" class="notif-action-btn" onclick="openQrForEvent(${eventId})">Open QR Pass</button></div>`;
    }
    if (notif.type === 'feedback_reminder') {
      return '<div class="notif-item-actions"><button type="button" class="notif-action-btn" onclick="switchPage(\'feedback\')">Leave Feedback</button></div>';
    }
    if (notif.type === 'schedule_update') {
      return '<div class="notif-item-actions"><button type="button" class="notif-action-btn" onclick="switchPage(\'my-schedule\')">Open Schedule</button></div>';
    }
    if (notif.type === 'registration_confirmation') {
      return '<div class="notif-item-actions"><button type="button" class="notif-action-btn" onclick="switchPage(\'my-events\')">View Event</button></div>';
    }

    return '';
  }

  function renderNotificationsPage() {
    const el = document.getElementById('notificationsPageList');
    if (!el) return;
    if (notifications.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-text">No notifications yet.</div></div>';
      return;
    }
    el.innerHTML = notifications.map(buildNotifItem).join('');
  }

  function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
      renderNotifDropdown();
    }
  }

  function closeNotifDropdown() {
    const d = document.getElementById('notifDropdown');
    if (d) d.classList.add('hidden');
  }

  function renderNotifDropdown() {
    const el = document.getElementById('notifDropdownItems');
    if (!el) return;
    const preview = notifications.slice(0, 5);
    if (preview.length === 0) {
      el.innerHTML = '<div class="notif-empty-msg">No notifications yet.</div>';
      return;
    }
    el.innerHTML = preview.map(buildNotifItem).join('');
  }

  function markAllRead() {
    notifications.forEach(n => { n.is_read = true; });
    updateNotifBadge();
    renderNotifDropdown();
    renderNotificationsPage();
  }

  // ── Initialise ──
  async function init() {
    // Header greeting (desktop)
    const greetEl = document.getElementById('portalUserGreeting');
    if (greetEl) greetEl.textContent = `Welcome, ${user.name || 'Attendee'}`;
    // Sidebar user card
    const sidebarName   = document.getElementById('sidebarUserName');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarName)   sidebarName.textContent   = user.name || 'Attendee';
    if (sidebarAvatar) sidebarAvatar.textContent  = (user.name || 'A').charAt(0).toUpperCase();

    // Load data in parallel
    await Promise.all([loadAllEvents(), loadNotifications()]);

    // Render dashboard (default tab)
    tabsLoaded['dashboard'] = true;
    renderDashboard();

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      const bell = document.getElementById('notifBellBtn');
      const dropdown = document.getElementById('notifDropdown');
      if (bell && dropdown && !bell.contains(e.target) && !dropdown.contains(e.target)) {
        closeNotifDropdown();
      }
    });
  }

  // ── Global Exports ──
  window.logout = logout;
  window.switchPage = switchPage;
  window.switchTab  = switchTab;
  window.toggleSidebar = toggleSidebar;
  window.closeSidebar  = closeSidebar;
  window.openQrForEvent = openQrForEvent;
  window.closeQrPanel = closeQrPanel;
  window.openFeedbackForm = openFeedbackForm;
  window.closeFeedbackForm = closeFeedbackForm;
  window.setRating = setRating;
  window.submitInlineFeedback = submitInlineFeedback;
  window.toggleNotifDropdown = toggleNotifDropdown;
  window.markAllRead = markAllRead;

  document.addEventListener('DOMContentLoaded', init);
})();
