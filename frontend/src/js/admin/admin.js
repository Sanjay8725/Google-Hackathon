(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user.role !== 'admin') {
    window.location.href = '../auth.html';
    return;
  }

  const state = {
    section: 'dashboard',
    events: [],
    users: [],
    organizers: [],
    registrations: [],
    feedback: [],
    analytics: null,
    modalSaveHandler: null
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtDate(value) {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString();
  }

  function statusPill(value) {
    return `<span class="pill">${escapeHtml(value || '-')}</span>`;
  }

  function showMessage(id, text, isError) {
    const element = byId(id);
    if (!element) {
      return;
    }
    element.textContent = text || '';
    element.style.color = isError ? '#b91c1c' : '#047857';
  }

  function renderBodyRows(tbodyId, html) {
    const tbody = byId(tbodyId);
    if (!tbody) {
      return;
    }
    tbody.innerHTML = html || '<tr><td colspan="6">No data found.</td></tr>';
  }

  function switchSection(section) {
    state.section = section;
    document.querySelectorAll('.admin-section').forEach(function (sectionNode) {
      sectionNode.classList.add('is-hidden');
    });
    document.querySelectorAll('[data-admin-section]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.adminSection === section);
    });

    const target = byId(section + '-section');
    if (target) {
      target.classList.remove('is-hidden');
    }

    if (section === 'dashboard') loadDashboard();
    if (section === 'organizers') loadOrganizers();
    if (section === 'events') loadEvents();
    if (section === 'users') loadUsers();
    if (section === 'registrations') loadRegistrations();
    if (section === 'analytics') loadAnalytics();
    if (section === 'feedback') loadFeedback();
    if (section === 'settings') loadSettings();
  }

  function drawSimpleBarChart(canvasId, labels, values, color) {
    const canvas = byId(canvasId);
    if (!canvas || !canvas.getContext) {
      return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!values.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('No chart data available', 20, 24);
      return;
    }

    const maxValue = Math.max.apply(null, values.concat([1]));
    const gap = 16;
    const barWidth = (width - gap * (values.length + 1)) / values.length;

    values.forEach(function (value, idx) {
      const normalizedHeight = (value / maxValue) * (height - 60);
      const x = gap + idx * (barWidth + gap);
      const y = height - normalizedHeight - 24;
      ctx.fillStyle = color || '#0f766e';
      ctx.fillRect(x, y, barWidth, normalizedHeight);

      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(value), x, y - 6);
      ctx.fillText(String(labels[idx]).slice(0, 10), x, height - 6);
    });
  }

  function openModal(title, fields, onSave) {
    byId('modalTitle').textContent = title;
    const form = byId('modalForm');
    form.innerHTML = fields
      .map(function (field) {
        if (field.type === 'select') {
          return `
            <label>${escapeHtml(field.label)}</label>
            <select name="${escapeHtml(field.name)}" class="input">
              ${field.options
                .map(function (option) {
                  const selected = String(option.value) === String(field.value) ? 'selected' : '';
                  return `<option value="${escapeHtml(option.value)}" ${selected}>${escapeHtml(option.label)}</option>`;
                })
                .join('')}
            </select>
          `;
        }

        return `
          <label>${escapeHtml(field.label)}</label>
          <input name="${escapeHtml(field.name)}" class="input" type="${escapeHtml(field.type || 'text')}" value="${escapeHtml(field.value || '')}">
        `;
      })
      .join('');

    state.modalSaveHandler = onSave;
    byId('editModal').classList.remove('is-hidden');
  }

  function closeModal() {
    byId('editModal').classList.add('is-hidden');
    byId('modalForm').innerHTML = '';
    state.modalSaveHandler = null;
  }

  async function loadDashboard() {
    const [statsResult, eventsResult, registrationsResult] = await Promise.all([
      window.api.getAdminDashboard(),
      window.api.getAdminEvents({ limit: 10 }),
      window.api.getRegistrationsAdmin({ limit: 10 })
    ]);

    const stats = statsResult && statsResult.success ? statsResult.stats : null;
    const events = eventsResult && eventsResult.success ? eventsResult.events : [];
    const registrations = registrationsResult && registrationsResult.success ? registrationsResult.registrations : [];
    state.events = events;

    const roles = (stats && stats.usersByRole) || [];
    const organizersCount = (roles.find(function (item) { return item.role === 'organizer'; }) || {}).count || 0;
    const attendeesCount = (roles.find(function (item) { return item.role === 'attendee'; }) || {}).count || 0;

    byId('totalEventsValue').textContent = stats ? stats.overview.totalEvents : 0;
    byId('totalOrganizersValue').textContent = organizersCount;
    byId('totalAttendeesValue').textContent = attendeesCount;
    byId('totalRegistrationsValue').textContent = stats ? stats.overview.totalRegistrations : 0;

    renderBodyRows(
      'recentEventsTableBody',
      events
        .map(function (event) {
          return `
            <tr>
              <td>${escapeHtml(event.title)}</td>
              <td>${statusPill(event.status)}</td>
              <td>${escapeHtml(fmtDate(event.date))}</td>
              <td>${escapeHtml(event.organizer_name)}</td>
            </tr>
          `;
        })
        .join('')
    );

    renderBodyRows(
      'latestRegistrationsTableBody',
      registrations
        .map(function (registration) {
          return `
            <tr>
              <td>${escapeHtml(registration.attendee_name)}</td>
              <td>${escapeHtml(registration.event_title)}</td>
              <td>${escapeHtml(fmtDate(registration.registration_date))}</td>
            </tr>
          `;
        })
        .join('')
    );

    const eventsByStatus = (stats && stats.eventsByStatus) || [];
    drawSimpleBarChart(
      'dashboardTrendChart',
      eventsByStatus.map(function (item) { return item.status; }),
      eventsByStatus.map(function (item) { return Number(item.count || 0); }),
      '#0f766e'
    );

    drawSimpleBarChart(
      'dashboardAttendanceChart',
      ['Registrations', 'Attendance'],
      [
        Number((stats && stats.overview && stats.overview.totalRegistrations) || 0),
        Number((stats && stats.overview && stats.overview.totalAttendance) || 0)
      ],
      '#0369a1'
    );
  }

  async function loadOrganizers() {
    const search = byId('organizerSearch').value.trim();
    const status = byId('organizerStatusFilter').value;
    const result = await window.api.getOrganizersAdmin({ search: search, status: status, limit: 100 });
    const organizers = result && result.success ? result.organizers : [];
    state.organizers = organizers;

    renderBodyRows(
      'organizersTableBody',
      organizers
        .map(function (organizer) {
          return `
            <tr>
              <td>${escapeHtml(organizer.name)}</td>
              <td>${escapeHtml(organizer.email)}</td>
              <td>${escapeHtml(organizer.organization_name || '-')}</td>
              <td>${statusPill(organizer.verification_status)}</td>
              <td>
                <button class="btn btn-primary btn-sm" data-action="verify-organizer" data-id="${organizer.id}">Approve</button>
                <button class="btn btn-secondary btn-sm" data-action="reject-organizer" data-id="${organizer.id}">Reject</button>
                <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${organizer.id}">Remove</button>
              </td>
            </tr>
          `;
        })
        .join('')
    );
  }

  function showCredentialSummary(payload) {
    const credentials = payload && payload.credentials ? payload.credentials : null;
    if (!credentials) {
      return;
    }

    const generatedHint = credentials.autoGeneratedPassword ? ' (auto-generated)' : '';
    alert(
      'Organizer created successfully.\n\n'
      + 'Username: ' + (credentials.username || '-') + '\n'
      + 'Password: ' + (credentials.password || '-') + generatedHint
    );
  }

  function openCreateOrganizerModal() {
    openModal(
      'Add Organizer Credentials',
      [
        { name: 'name', label: 'Organizer Name' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'username', label: 'Username (optional)' },
        { name: 'password', label: 'Password (optional, leave blank to auto-generate)', type: 'text' }
      ],
      async function (values) {
        const payload = {
          name: String(values.name || '').trim(),
          email: String(values.email || '').trim(),
          username: String(values.username || '').trim(),
          password: String(values.password || '').trim(),
          role: 'organizer'
        };

        if (!payload.name || !payload.email) {
          alert('Please provide organizer name and email.');
          return;
        }

        const result = await window.api.addUser(payload);
        if (!result || !result.success) {
          alert((result && result.message) || 'Failed to create organizer credentials.');
          return;
        }

        showCredentialSummary(result);
        closeModal();
        loadOrganizers();
      }
    );
  }

  async function loadEvents() {
    const search = byId('eventSearch').value.trim();
    const status = byId('statusFilter').value;
    const result = await window.api.getAdminEvents({ search: search, status: status, limit: 100 });
    const events = result && result.success ? result.events : [];
    state.events = events;

    renderBodyRows(
      'eventsTableBody',
      events
        .map(function (event) {
          return `
            <tr>
              <td>${escapeHtml(event.title)}</td>
              <td>${statusPill(event.status)}</td>
              <td>${escapeHtml(fmtDate(event.date))}</td>
              <td>${escapeHtml(event.organizer_name)}</td>
              <td>
                <button class="btn btn-primary btn-sm" data-action="approve-event" data-id="${event.id}">Approve</button>
                <button class="btn btn-secondary btn-sm" data-action="edit-event" data-id="${event.id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-action="delete-event" data-id="${event.id}">Delete</button>
              </td>
            </tr>
          `;
        })
        .join('')
    );
  }

  async function loadUsers() {
    const search = byId('userSearch').value.trim();
    const role = byId('roleFilter').value;
    const result = await window.api.getUsers({ search: search, role: role, limit: 100 });
    const users = result && result.success ? result.users : [];
    state.users = users;

    renderBodyRows(
      'usersTableBody',
      users
        .map(function (entry) {
          return `
            <tr>
              <td>${escapeHtml(entry.name)}</td>
              <td>${escapeHtml(entry.email)}</td>
              <td>${statusPill(entry.role)}</td>
              <td>${entry.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button class="btn btn-secondary btn-sm" data-action="edit-user" data-id="${entry.id}">Edit</button>
                <button class="btn btn-primary btn-sm" data-action="toggle-user" data-id="${entry.id}">${entry.is_active ? 'Block' : 'Unblock'}</button>
                <button class="btn btn-danger btn-sm" data-action="delete-user" data-id="${entry.id}">Remove</button>
              </td>
            </tr>
          `;
        })
        .join('')
    );
  }

  async function loadRegistrationEventFilter() {
    const result = await window.api.getAdminEvents({ limit: 200 });
    const events = result && result.success ? result.events : [];
    const select = byId('registrationEventFilter');
    select.innerHTML = '<option value="">All events</option>' + events
      .map(function (event) {
        return `<option value="${event.id}">${escapeHtml(event.title)}</option>`;
      })
      .join('');
  }

  async function loadRegistrations() {
    const search = byId('registrationSearch').value.trim();
    const eventId = byId('registrationEventFilter').value;
    const result = await window.api.getRegistrationsAdmin({ search: search, eventId: eventId, limit: 200 });
    const registrations = result && result.success ? result.registrations : [];
    state.registrations = registrations;

    renderBodyRows(
      'registrationsTableBody',
      registrations
        .map(function (registration) {
          return `
            <tr>
              <td>${escapeHtml(registration.event_title)}</td>
              <td>${escapeHtml(registration.attendee_name)}</td>
              <td>${escapeHtml(registration.attendee_email)}</td>
              <td>${escapeHtml(registration.ticket_type || 'General')}</td>
              <td>${escapeHtml(fmtDate(registration.registration_date))}</td>
            </tr>
          `;
        })
        .join('')
    );
  }

  async function exportRegistrations() {
    const eventId = byId('registrationEventFilter').value;
    const exportResult = await window.api.exportRegistrationsAdmin({ eventId: eventId });
    if (!exportResult || !exportResult.success) {
      alert((exportResult && exportResult.message) || 'Failed to export registrations');
      return;
    }

    const blob = new Blob([exportResult.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registrations-' + (eventId || 'all') + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function sendAnnouncement(event) {
    event.preventDefault();
    const title = byId('announcementTitle').value.trim();
    const message = byId('announcementMessage').value.trim();
    const target = byId('announcementTarget').value;

    const result = await window.api.createAnnouncement({
      title: title,
      message: message,
      target: target,
      created_by: user.id || null
    });

    if (result && result.success) {
      showMessage('announcementStatus', 'Announcement sent successfully.', false);
      byId('announcementForm').reset();
      return;
    }

    showMessage('announcementStatus', (result && result.message) || 'Failed to send announcement.', true);
  }

  async function loadAnalytics() {
    const result = await window.api.getSystemAnalytics();
    const analytics = result && result.success ? result.analytics : null;
    state.analytics = analytics;

    const topEvents = analytics && analytics.topEvents ? analytics.topEvents : [];
    renderBodyRows(
      'analyticsTopEventsBody',
      topEvents
        .map(function (event) {
          return `
            <tr>
              <td>${escapeHtml(event.title)}</td>
              <td>${escapeHtml(event.registered)}</td>
              <td>${escapeHtml(event.engagement)}</td>
              <td>${escapeHtml(event.avg_rating)}</td>
            </tr>
          `;
        })
        .join('')
    );

    const trends = analytics && analytics.eventTrends ? analytics.eventTrends : [];
    drawSimpleBarChart(
      'analyticsRegistrationChart',
      trends.map(function (item) { return item.month; }),
      trends.map(function (item) { return Number(item.total_registrations || 0); }),
      '#0f766e'
    );

    const categories = analytics && analytics.categoryStats ? analytics.categoryStats : [];
    drawSimpleBarChart(
      'analyticsCategoryChart',
      categories.map(function (item) { return item.category; }),
      categories.map(function (item) { return Number(item.count || 0); }),
      '#7c3aed'
    );
  }

  async function generateReport() {
    const type = byId('reportType').value;
    const startDate = byId('reportStartDate').value;
    const endDate = byId('reportEndDate').value;
    const result = await window.api.generateReport(type, startDate, endDate);

    byId('reportResults').textContent = JSON.stringify(result, null, 2);
  }

  async function loadFeedback() {
    const search = byId('feedbackSearch').value.trim();
    const result = await window.api.getFeedbackAdmin({ search: search, limit: 200 });
    const feedback = result && result.success ? result.feedback : [];
    state.feedback = feedback;

    renderBodyRows(
      'feedbackTableBody',
      feedback
        .map(function (entry) {
          return `
            <tr>
              <td>${escapeHtml(entry.attendee_name)}</td>
              <td>${escapeHtml(entry.event_title)}</td>
              <td>${escapeHtml(entry.rating)}</td>
              <td>${escapeHtml(entry.comment || entry.improvement_suggestions || '-')}</td>
              <td>${escapeHtml(fmtDate(entry.submitted_at))}</td>
            </tr>
          `;
        })
        .join('')
    );
  }

  async function loadSettings() {
    const result = await window.api.getAdminSettings();
    if (!result || !result.success) {
      showMessage('settingsStatus', 'Failed to load settings.', true);
      return;
    }

    const settings = result.settings;
    byId('maintenanceMode').checked = Boolean(settings.platform.maintenanceMode);
    byId('registrationApprovalRequired').checked = Boolean(settings.platform.registrationApprovalRequired);
    byId('defaultTimezone').value = settings.platform.defaultTimezone || 'UTC';
    byId('enforceStrongPasswords').checked = Boolean(settings.security.enforceStrongPasswords);
    byId('certificateTemplatesEnabled').checked = Boolean(settings.security.certificateTemplatesEnabled);
    byId('maxLoginAttempts').value = Number(settings.security.maxLoginAttempts || 5);
    byId('sessionTimeoutMinutes').value = Number(settings.security.sessionTimeoutMinutes || 120);
    byId('eventCategories').value = (settings.categories || []).join(', ');
  }

  async function saveSettings() {
    const payload = {
      platform: {
        maintenanceMode: byId('maintenanceMode').checked,
        registrationApprovalRequired: byId('registrationApprovalRequired').checked,
        defaultTimezone: byId('defaultTimezone').value.trim() || 'UTC'
      },
      security: {
        enforceStrongPasswords: byId('enforceStrongPasswords').checked,
        certificateTemplatesEnabled: byId('certificateTemplatesEnabled').checked,
        maxLoginAttempts: Number(byId('maxLoginAttempts').value || 5),
        sessionTimeoutMinutes: Number(byId('sessionTimeoutMinutes').value || 120)
      },
      categories: byId('eventCategories').value
        .split(',')
        .map(function (item) { return item.trim(); })
        .filter(function (item) { return item.length > 0; })
    };

    const result = await window.api.updateAdminSettings(payload);
    showMessage(
      'settingsStatus',
      result && result.success ? 'Settings saved successfully.' : ((result && result.message) || 'Failed to save settings.'),
      !(result && result.success)
    );
  }

  async function onTableActionClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    if (action === 'approve-event') {
      await window.api.approveEventAdmin(id);
      loadEvents();
      return;
    }

    if (action === 'delete-event') {
      if (window.confirm('Delete this event?')) {
        await window.api.deleteEventAdmin(id);
        loadEvents();
      }
      return;
    }

    if (action === 'edit-event') {
      const eventData = state.events.find(function (item) { return Number(item.id) === id; });
      if (!eventData) {
        return;
      }

      openModal(
        'Edit Event',
        [
          { name: 'title', label: 'Title', value: eventData.title },
          { name: 'date', label: 'Date', type: 'date', value: eventData.date ? String(eventData.date).slice(0, 10) : '' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: eventData.status,
            options: [
              { value: 'Planning', label: 'Planning' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Live', label: 'Live' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]
          },
          { name: 'category', label: 'Category', value: eventData.category || '' },
          { name: 'capacity', label: 'Capacity', type: 'number', value: eventData.capacity || 0 }
        ],
        async function (values) {
          await window.api.updateEventAdmin(id, values);
          closeModal();
          loadEvents();
        }
      );
      return;
    }

    if (action === 'edit-user') {
      const userData = state.users.find(function (item) { return Number(item.id) === id; });
      if (!userData) {
        return;
      }

      openModal(
        'Edit User',
        [
          { name: 'name', label: 'Name', value: userData.name || '' },
          { name: 'email', label: 'Email', value: userData.email || '' },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            value: userData.role,
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'organizer', label: 'Organizer' },
              { value: 'attendee', label: 'Attendee' }
            ]
          }
        ],
        async function (values) {
          await window.api.updateUserAdmin(id, values);
          closeModal();
          loadUsers();
        }
      );
      return;
    }

    if (action === 'toggle-user') {
      const userData = state.users.find(function (item) { return Number(item.id) === id; })
        || state.organizers.find(function (item) { return Number(item.id) === id; });
      if (!userData) {
        return;
      }
      await window.api.updateUserAdmin(id, { is_active: !Boolean(userData.is_active) });
      if (state.section === 'users') {
        loadUsers();
      }
      if (state.section === 'organizers') {
        loadOrganizers();
      }
      return;
    }

    if (action === 'delete-user') {
      if (window.confirm('Remove this user account?')) {
        await window.api.deleteUserAdmin(id);
        loadUsers();
        loadOrganizers();
      }
      return;
    }

    if (action === 'verify-organizer') {
      await window.api.updateOrganizerStatusAdmin(id, 'verified');
      loadOrganizers();
      return;
    }

    if (action === 'reject-organizer') {
      await window.api.updateOrganizerStatusAdmin(id, 'rejected');
      loadOrganizers();
    }
  }

  function setupEventBindings() {
    document.querySelectorAll('[data-admin-section]').forEach(function (button) {
      button.addEventListener('click', function () {
        switchSection(button.dataset.adminSection);
      });
    });

    byId('logoutButton').addEventListener('click', function () {
      localStorage.removeItem('user');
      window.location.href = '../index.html';
    });

    byId('searchEventsButton').addEventListener('click', loadEvents);
    byId('searchUsersButton').addEventListener('click', loadUsers);
    byId('createOrganizerButton').addEventListener('click', openCreateOrganizerModal);
    byId('refreshOrganizersButton').addEventListener('click', loadOrganizers);
    byId('loadRegistrationsButton').addEventListener('click', loadRegistrations);
    byId('exportRegistrationsButton').addEventListener('click', exportRegistrations);
    byId('loadFeedbackButton').addEventListener('click', loadFeedback);
    byId('generateReportButton').addEventListener('click', generateReport);
    byId('saveSettingsButton').addEventListener('click', saveSettings);
    byId('announcementForm').addEventListener('submit', sendAnnouncement);

    document.body.addEventListener('click', onTableActionClick);

    byId('cancelModalButton').addEventListener('click', closeModal);
    byId('saveModalButton').addEventListener('click', function () {
      if (!state.modalSaveHandler) {
        return;
      }
      const values = {};
      new FormData(byId('modalForm')).forEach(function (value, key) {
        values[key] = value;
      });
      state.modalSaveHandler(values);
    });

    // Mobile hamburger menu setup
    const adminMenuToggle = byId('adminMenuToggle');
    const adminOverlay = byId('adminOverlay');
    const adminSidebar = document.querySelector('.admin-sidebar');

    if (adminMenuToggle && adminOverlay && adminSidebar) {
      adminMenuToggle.addEventListener('click', function () {
        adminSidebar.classList.toggle('mobile-open');
        adminMenuToggle.classList.toggle('active');
        adminOverlay.classList.toggle('active');
      });

      adminOverlay.addEventListener('click', function () {
        adminSidebar.classList.remove('mobile-open');
        adminMenuToggle.classList.remove('active');
        adminOverlay.classList.remove('active');
      });

      document.addEventListener('click', function (e) {
        if (!adminSidebar.contains(e.target) && !adminMenuToggle.contains(e.target)) {
          if (adminSidebar.classList.contains('mobile-open')) {
            adminSidebar.classList.remove('mobile-open');
            adminMenuToggle.classList.remove('active');
            adminOverlay.classList.remove('active');
          }
        }
      });
    }
  }

  async function init() {
    const label = byId('currentAdminLabel');
    if (label) {
      label.textContent = user.name || user.email || 'Admin';
    }

    setupEventBindings();
    await loadRegistrationEventFilter();
    switchSection('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
