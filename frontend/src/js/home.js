(function () {
  function goToAuth(role) {
    if (role) {
      localStorage.setItem('selectedRole', role);
    } else {
      localStorage.removeItem('selectedRole');
    }
    window.location.href = 'auth.html';
  }

  window.goToAuth = goToAuth;
})();
