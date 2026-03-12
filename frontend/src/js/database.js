function byId(id) {
  return document.getElementById(id);
}

function showResult(label, payload) {
  const output = byId('output');
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  output.textContent = label + "\n\n" + text;
}

async function runAction(label, action) {
  try {
    const result = await action();
    showResult(label, result);
  } catch (error) {
    showResult(label + ' (error)', { success: false, message: error.message });
  }
}

function toNumber(value) {
  return Number(value);
}

byId('registerForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    name: byId('regName').value.trim(),
    username: byId('regUsername').value.trim(),
    email: byId('regEmail').value.trim(),
    password: byId('regPassword').value,
    role: byId('regRole').value
  };

  await runAction('Register User', function () {
    return window.api.register(payload);
  });
});

byId('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    usernameOrEmail: byId('loginUsernameOrEmail').value.trim(),
    password: byId('loginPassword').value,
    role: byId('loginRole').value || undefined
  };

  await runAction('Login', function () {
    return window.api.login(payload);
  });
});

byId('createEventForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    organizer_id: toNumber(byId('eventOrganizerId').value),
    title: byId('eventTitle').value.trim(),
    description: byId('eventDescription').value.trim(),
    date: byId('eventDate').value,
    time: byId('eventTime').value.trim(),
    location: byId('eventLocation').value.trim(),
    capacity: toNumber(byId('eventCapacity').value || '0'),
    category: byId('eventCategory').value.trim() || 'General'
  };

  await runAction('Create Event', function () {
    return window.api.createEvent(payload);
  });
});

byId('eventRegisterForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const eventId = toNumber(byId('regEventId').value);
  const userId = toNumber(byId('regUserId').value);
  const ticketType = byId('regTicketType').value.trim() || 'General';

  await runAction('Register For Event', function () {
    return window.api.registerForEvent(eventId, userId, ticketType);
  });
});

byId('checkinForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    event_id: toNumber(byId('checkinEventId').value),
    user_id: toNumber(byId('checkinUserId').value),
    qr_code: byId('checkinQrCode').value.trim() || null,
    check_in_method: byId('checkinMethod').value
  };

  await runAction('Attendance Check-in', function () {
    return window.api.checkIn(payload);
  });
});

byId('feedbackForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    event_id: toNumber(byId('feedbackEventId').value),
    user_id: toNumber(byId('feedbackUserId').value),
    rating: toNumber(byId('feedbackRating').value),
    comment: byId('feedbackComment').value.trim()
  };

  await runAction('Submit Feedback', function () {
    return window.api.submitFeedback(payload);
  });
});

byId('engagementForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    event_id: toNumber(byId('engagementEventId').value),
    user_id: toNumber(byId('engagementUserId').value),
    action: byId('engagementAction').value.trim()
  };

  await runAction('Track Engagement', function () {
    return window.api.trackEngagement(payload);
  });
});

byId('btnGetEvents').addEventListener('click', async function () {
  await runAction('Get All Events', function () {
    return window.api.getAllEvents();
  });
});

byId('btnGetFeedbackStats').addEventListener('click', async function () {
  const eventId = toNumber(byId('queryEventId').value);
  await runAction('Get Feedback Stats', function () {
    return window.api.getFeedbackStats(eventId);
  });
});

byId('btnGetEventAnalytics').addEventListener('click', async function () {
  const eventId = toNumber(byId('queryEventId').value);
  await runAction('Get Event Analytics', function () {
    return window.api.getEventAnalytics(eventId);
  });
});

byId('btnGetDashboardAnalytics').addEventListener('click', async function () {
  const organizerId = toNumber(byId('queryOrganizerId').value);
  await runAction('Get Organizer Dashboard Analytics', function () {
    return window.api.getDashboardAnalytics(organizerId);
  });
});
