(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) {
    window.location.href = '../auth.html';
    return;
  }

  function goBack() {
    window.location.href = 'attendee-dashboard.html';
  }

  async function renderQRCode() {
    const page = document.getElementById('pageContent');
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');

    try {
      if (!eventId) {
        page.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎟️</div><div class="empty-state-text">Select an event to view its QR pass</div></div>';
        return;
      }

      const result = await window.api.getEventById(eventId);
      const event = result.success ? result.event : null;

      if (!event) {
        page.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Event not found</div></div>';
        return;
      }

      page.innerHTML = `
        <div class="qr-card">
          <div class="qr-header">
            <h3>${event.title}</h3>
            <p>${event.date} • ${event.time}</p>
          </div>
          <div class="qr-code" style="font-size: 72px; text-align: center;">🎟️</div>
          <div class="qr-footer">Present this pass at entry</div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load QR pass:', error);
      page.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load QR pass</div></div>';
    }
  }

  window.goBack = goBack;
  document.addEventListener('DOMContentLoaded', renderQRCode);
})();
