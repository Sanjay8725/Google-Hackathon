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

  function goDashboard(section) {
    const target = section ? `organizer-dashboard.html#${section}` : 'organizer-dashboard.html';
    window.location.href = target;
  }

  function saveSettings() {
    alert('Settings saved (mock).');
  }

  window.logout = logout;
  window.goDashboard = goDashboard;
  window.saveSettings = saveSettings;
})();
