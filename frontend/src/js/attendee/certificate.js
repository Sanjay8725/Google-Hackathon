(function () {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) {
    window.location.href = '../auth.html';
    return;
  }

  function goBack() {
    window.location.href = 'attendee-dashboard.html';
  }

  async function renderCertificate() {
    const page = document.getElementById('pageContent');
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');

    try {
      if (!eventId) {
        page.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><div class="empty-state-text">Select an event to view your certificate</div></div>';
        return;
      }

      const result = await window.api.getCertificate(user.id, eventId);

      if (!result || !result.success || !result.certificate) {
        page.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">${(result && result.message) || 'Certificate is not available for this event.'}</div></div>`;
        return;
      }

      const cert = result.certificate;
      page.innerHTML = `
        <div class="certificate-card">
          <h2>🏆 Certificate of Attendance</h2>
          <p>This certifies that</p>
          <h3>${cert.attendee_name || user.name || 'Attendee'}</h3>
          <p>attended</p>
          <h4>${cert.event_title}</h4>
          <p>${cert.event_date}</p>
          <p>Issued: ${cert.issue_date}</p>
          <button class="action-btn primary" onclick="window.print()">Print</button>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load certificate:', error);
      page.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load certificate</div></div>';
    }
  }

  window.goBack = goBack;
  document.addEventListener('DOMContentLoaded', renderCertificate);
})();
