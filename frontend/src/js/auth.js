(function () {
  let isLogin = true;
  let selectedRole = null;
  const selfSignupRole = 'attendee';

  function setMessage(message, isError) {
    const msg = document.getElementById('authMessage');
    if (!msg) return;
    msg.classList.remove('hidden');
    msg.style.display = 'block';
    msg.textContent = message;
    msg.style.color = isError ? '#ef4444' : '#10b981';
  }

  function clearMessage() {
    const msg = document.getElementById('authMessage');
    if (!msg) return;
    msg.classList.add('hidden');
    msg.style.display = 'none';
    msg.textContent = '';
  }

  function syncSelectedRole() {
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    if (selectedRole) {
      const id = selectedRole + 'Role';
      const btn = document.getElementById(id);
      if (btn) btn.classList.add('active');
    }
  }

  function updateRoleAvailability() {
    const restrictedRoles = ['admin', 'organizer'];
    restrictedRoles.forEach((role) => {
      const button = document.getElementById(role + 'Role');
      if (!button) return;
      const shouldDisable = !isLogin;
      button.disabled = shouldDisable;
      button.classList.toggle('signup-disabled', shouldDisable);
      button.classList.toggle('hidden', shouldDisable);
      button.setAttribute('aria-disabled', String(shouldDisable));
    });

    const signupRoleNote = document.getElementById('signupRoleNote');
    if (signupRoleNote) {
      signupRoleNote.classList.toggle('hidden', isLogin);
    }

    if (!isLogin && selectedRole !== selfSignupRole) {
      selectedRole = selfSignupRole;
      localStorage.setItem('selectedRole', selectedRole);
    }

    syncSelectedRole();
  }

  function toggleAuth(forceLogin) {
    clearMessage();
    if (typeof forceLogin === 'boolean') {
      isLogin = forceLogin;
    } else {
      isLogin = !isLogin;
    }

    // Clear form fields
    const nameInput = document.getElementById('authName');
    const usernameInput = document.getElementById('authUsername');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    
    if (nameInput) nameInput.value = '';
    if (usernameInput) usernameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleLink = document.getElementById('toggleLink');
    const nameField = document.getElementById('nameField');
    const usernameField = document.getElementById('usernameField');
    const emailLabel = document.getElementById('emailLabel');

    if (isLogin) {
      loginBtn.classList.add('active');
      signupBtn.classList.remove('active');
      submitBtn.textContent = 'Login';
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = 'Sign up';
      nameField.classList.add('hidden');
      usernameField.classList.add('hidden');
      emailLabel.textContent = 'Username or Email';
    } else {
      loginBtn.classList.remove('active');
      signupBtn.classList.add('active');
      submitBtn.textContent = 'Create Account';
      toggleText.textContent = 'Already have an account?';
      toggleLink.textContent = 'Login';
      nameField.classList.remove('hidden');
      usernameField.classList.remove('hidden');
      emailLabel.textContent = 'Email';
    }

    updateRoleAvailability();
  }

  function selectRole(role) {
    if (!isLogin && role !== selfSignupRole) {
      setMessage('Admin and Organizer accounts are login-only. Please sign up as Attendee.', true);
      return;
    }

    selectedRole = role;
    localStorage.setItem('selectedRole', role);
    syncSelectedRole();
  }

  function goHome() {
    window.location.href = 'index.html';
  }

  async function handleAuth(event) {
    event.preventDefault();
    clearMessage();

    // Get form field elements
    const nameInput = document.getElementById('authName');
    const usernameInput = document.getElementById('authUsername');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');

    // Verify elements exist
    if (!emailInput || !passwordInput) {
      setMessage('Form elements not found. Please refresh the page.', true);
      console.error('❌ Missing form elements');
      return;
    }

    const name = nameInput ? nameInput.value.trim() : '';
    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      setMessage('Please enter email/username and password.', true);
      return;
    }

    if (!selectedRole) {
      setMessage('Please select a role.', true);
      return;
    }

    try {
      let result;
      if (isLogin) {
        // For login: send usernameOrEmail
        console.log('🔐 Attempting login with:', { usernameOrEmail: email, role: selectedRole });
        result = await window.api.login({ usernameOrEmail: email, password, role: selectedRole });
        console.log('✅ Login response:', result);
      } else {
        // For signup: send name, username, email
        if (!name || !username) {
          setMessage('Please enter name and username.', true);
          return;
        }
        console.log('📝 Attempting signup with:', { name, username, email, role: selectedRole });
        result = await window.api.register({ name, username, email, password, role: selectedRole });
        console.log('✅ Signup response:', result);
      }

      if (!result || !result.success) {
        console.error('❌ Auth failed:', result);
        setMessage(result && result.message ? result.message : 'Authentication failed.', true);
        return;
      }

      const user = result.user || { name, username, email, role: selectedRole };
      console.log('📦 User object:', user);
      console.log('🎯 User role:', user.role);
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('selectedRole');

      // Redirect based on role with proper paths
      setTimeout(() => {
        if (user.role === 'admin') {
          console.log('➡️ Redirecting to admin dashboard');
          window.location.href = 'admin/admin.html';
        } else if (user.role === 'organizer') {
          console.log('➡️ Redirecting to organizer dashboard');
          window.location.href = 'organizer/organizer-dashboard.html';
        } else if (user.role === 'attendee') {
          console.log('➡️ Redirecting to attendee dashboard');
          window.location.href = 'attendee/attendee-dashboard.html';
        } else {
          console.error('❌ Unknown role:', user.role);
          setMessage('Unknown user role. Please contact support.', true);
        }
      }, 500);
    } catch (error) {
      console.error('❌ Auth error:', error);
      setMessage('Something went wrong. Please try again.', true);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const urlRole = new URLSearchParams(window.location.search).get('role');
    if (urlRole && ['admin', 'organizer', 'attendee'].includes(urlRole)) {
      selectedRole = urlRole;
      localStorage.setItem('selectedRole', urlRole);
    }

    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) {
      selectedRole = savedRole;
      syncSelectedRole();
    }
    updateRoleAvailability();
  });

  window.toggleAuth = toggleAuth;
  window.selectRole = selectRole;
  window.handleAuth = handleAuth;
  window.goHome = goHome;
})();
