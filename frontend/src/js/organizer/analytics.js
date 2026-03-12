(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id || user.role !== 'organizer') {
    window.location.href = '../auth.html';
    return;
  }

  function setMessage(id, type, text) {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.className = 'analytics-message ' + type;
    el.textContent = text;
  }

  function clearMessage(id) {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.className = 'analytics-message';
    el.textContent = '';
  }

  async function handleEngagementSubmit(event) {
    event.preventDefault();
    clearMessage('engagementMessage');

    const eventId = Number(document.getElementById('engagementEventId').value);
    const userId = Number(document.getElementById('engagementUserId').value);
    const action = (document.getElementById('engagementAction').value || '').trim();

    if (!eventId || !userId || !action) {
      setMessage('engagementMessage', 'error', 'Please fill Event ID, User ID and Action.');
      return;
    }

    try {
      const result = await window.api.trackEngagement({
        event_id: eventId,
        user_id: userId,
        action: action
      });

      if (result.success) {
        setMessage('engagementMessage', 'success', `Tracked successfully. Engagement score: ${result.engagement}%`);
      } else {
        setMessage('engagementMessage', 'error', result.message || 'Failed to track engagement.');
      }
    } catch (error) {
      console.error('Track engagement failed:', error);
      setMessage('engagementMessage', 'error', 'Connection failed while tracking engagement.');
    }
  }

  async function checkAnalyticsConnection() {
    clearMessage('connectionMessage');
    const output = document.getElementById('analyticsOutput');
    if (output) {
      output.textContent = 'Checking connection...';
    }

    try {
      const result = await window.api.getDashboardAnalytics(user.id);

      if (result.success) {
        setMessage('connectionMessage', 'success', 'Connected. Organizer analytics API is working.');
        if (output) {
          output.textContent = JSON.stringify(result.stats, null, 2);
        }
      } else {
        setMessage('connectionMessage', 'error', result.message || 'API returned an error.');
        if (output) {
          output.textContent = JSON.stringify(result, null, 2);
        }
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setMessage('connectionMessage', 'error', 'Unable to connect to analytics endpoint.');
      if (output) {
        output.textContent = String(error && error.message ? error.message : error);
      }
    }
  }

  function getNumericInput(id) {
    return Number((document.getElementById(id) || {}).value || 0);
  }

  async function runReadAction(label, action) {
    clearMessage('connectionMessage');
    const output = document.getElementById('analyticsOutput');
    if (output) {
      output.textContent = `${label}: loading...`;
    }

    try {
      const result = await action();
      if (result && result.success) {
        setMessage('connectionMessage', 'success', `${label}: API connected and data loaded.`);
      } else {
        setMessage('connectionMessage', 'error', `${label}: ${result && result.message ? result.message : 'Request failed.'}`);
      }
      if (output) {
        output.textContent = JSON.stringify(result, null, 2);
      }
    } catch (error) {
      setMessage('connectionMessage', 'error', `${label}: connection failed.`);
      if (output) {
        output.textContent = String(error && error.message ? error.message : error);
      }
    }
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.href = '../index.html';
  }

  function goDashboard(section) {
    const target = section ? `organizer-dashboard.html#${section}` : 'organizer-dashboard.html';
    window.location.href = target;
  }

  window.logout = logout;
  window.goDashboard = goDashboard;

  document.addEventListener('DOMContentLoaded', function () {
    const organizerField = document.getElementById('queryOrganizerId');
    if (organizerField) {
      organizerField.value = String(user.id);
    }

    const engagementForm = document.getElementById('engagementForm');
    if (engagementForm) {
      engagementForm.addEventListener('submit', handleEngagementSubmit);
    }

    const checkButton = document.getElementById('checkConnectionBtn');
    if (checkButton) {
      checkButton.addEventListener('click', checkAnalyticsConnection);
    }

    const btnGetEvents = document.getElementById('btnGetEvents');
    if (btnGetEvents) {
      btnGetEvents.addEventListener('click', function () {
        runReadAction('Get All Events', function () {
          return window.api.getAllEvents();
        });
      });
    }

    const btnGetFeedbackStats = document.getElementById('btnGetFeedbackStats');
    if (btnGetFeedbackStats) {
      btnGetFeedbackStats.addEventListener('click', function () {
        const eventId = getNumericInput('queryEventId');
        runReadAction('Get Feedback Stats', function () {
          return window.api.getFeedbackStats(eventId);
        });
      });
    }

    const btnGetEventAnalytics = document.getElementById('btnGetEventAnalytics');
    if (btnGetEventAnalytics) {
      btnGetEventAnalytics.addEventListener('click', function () {
        const eventId = getNumericInput('queryEventId');
        runReadAction('Get Event Analytics', function () {
          return window.api.getEventAnalytics(eventId);
        });
      });
    }

    const btnGetDashboardAnalytics = document.getElementById('btnGetDashboardAnalytics');
    if (btnGetDashboardAnalytics) {
      btnGetDashboardAnalytics.addEventListener('click', function () {
        const organizerId = getNumericInput('queryOrganizerId');
        runReadAction('Get Organizer Analytics', function () {
          return window.api.getDashboardAnalytics(organizerId);
        });
      });
    }

    checkAnalyticsConnection();

  });
})();
