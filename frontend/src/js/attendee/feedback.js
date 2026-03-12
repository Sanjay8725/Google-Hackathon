(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) {
    window.location.href = '../auth.html';
    return;
  }

  let selectedEventId = null;

  function goBack() {
    window.location.href = 'attendee-dashboard.html';
  }

  function showLoading(show) {
    const loading = document.getElementById('loadingView');
    const card = document.getElementById('feedbackCard');
    if (!loading || !card) {
      return;
    }
    loading.style.display = show ? 'grid' : 'none';
    card.style.display = show ? 'none' : 'block';
  }

  function showEmpty(message, icon) {
    const empty = document.getElementById('emptyView');
    const card = document.getElementById('feedbackCard');
    if (!empty || !card) {
      return;
    }
    empty.innerHTML = `<div class="empty-state-icon">${icon || '💬'}</div><div class="empty-state-text">${message}</div>`;
    empty.style.display = 'block';
    card.style.display = 'none';
  }

  function setupRatingListener() {
    const range = document.getElementById('ratingRange');
    const value = document.getElementById('ratingValue');
    if (!range || !value) {
      return;
    }
    value.textContent = range.value;
    range.addEventListener('input', function () {
      value.textContent = range.value;
    });
  }

  function setTitleForEvent(eventTitle) {
    const title = document.getElementById('feedbackTitle');
    if (title) {
      title.textContent = `Share your feedback for ${eventTitle}`;
    }
  }

  async function loadEventFromId(eventId) {
    const result = await window.api.getEventById(eventId);
    const event = result && result.success ? result.event : null;

    if (!event) {
      showEmpty('Event not found', '⚠️');
      return false;
    }

    selectedEventId = Number(event.id);
    setTitleForEvent(event.title);
    return true;
  }

  async function loadEventPicker() {
    const pickerWrap = document.getElementById('eventPickerWrap');
    const picker = document.getElementById('eventPicker');

    const scheduleResult = await window.api.getMySchedule(user.id);
    const events = scheduleResult && scheduleResult.success ? scheduleResult.schedule || [] : [];

    if (!events.length) {
      showEmpty('No registered events found for feedback', '📭');
      return false;
    }

    picker.innerHTML = events
      .map(function (item) {
        const safeTitle = String(item.title || 'Untitled Event');
        return `<option value="${item.id}">${safeTitle}</option>`;
      })
      .join('');

    pickerWrap.style.display = 'block';
    selectedEventId = Number(events[0].id);
    setTitleForEvent(events[0].title || 'Selected Event');

    picker.addEventListener('change', function () {
      const selected = events.find(function (item) {
        return Number(item.id) === Number(picker.value);
      });
      selectedEventId = Number(picker.value);
      setTitleForEvent(selected ? selected.title : 'Selected Event');
    });

    return true;
  }

  async function renderFeedback() {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');

    try {
      showLoading(true);
      setupRatingListener();

      if (eventIdParam) {
        const ok = await loadEventFromId(eventIdParam);
        if (!ok) {
          return;
        }
      } else {
        const ok = await loadEventPicker();
        if (!ok) {
          return;
        }
      }

      showLoading(false);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      showEmpty('Failed to load feedback', '⚠️');
    }
  }

  async function submitFeedback() {
    try {
      if (!selectedEventId) {
        alert('Please select an event first.');
        return;
      }

      const button = document.getElementById('submitFeedbackBtn');
      button.disabled = true;
      button.textContent = 'Submitting...';

      const rating = Number(document.getElementById('ratingRange').value || 5);
      const comment = document.getElementById('commentText').value.trim();
      const result = await window.api.submitFeedback({ event_id: selectedEventId, user_id: user.id, rating, comment });

      button.disabled = false;
      button.textContent = 'Submit Feedback';

      if (result.success) {
        alert('Thanks for your feedback!');
        window.location.href = 'attendee-dashboard.html';
      } else {
        alert(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback');
      const button = document.getElementById('submitFeedbackBtn');
      if (button) {
        button.disabled = false;
        button.textContent = 'Submit Feedback';
      }
    }
  }

  window.goBack = goBack;

  document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submitFeedbackBtn');
    if (submitButton) {
      submitButton.addEventListener('click', submitFeedback);
    }
    renderFeedback();
  });
})();
