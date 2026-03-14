// Global State Management
const appState = {
  currentPage: 'home',
  userRole: null,
  isLoggedIn: false,
  user: null,
  events: [
    {
      id: 1,
      name: 'Tech Summit 2026',
      date: '2026-02-15',
      time: '9:00 AM - 5:00 PM',
      attendees: 250,
      checkedIn: 187,
      registered: 250,
      budget: '$5000',
      status: 'Live',
      progress: 75,
      location: 'Convention Center',
      sessions: ['Opening Keynote', 'Web Dev Workshop', 'Networking Dinner'],
      engagement: 92,
      avgRating: 4.7,
      feedbackCount: 124,
      qrScans: 187,
    },
    {
      id: 2,
      name: 'Web Dev Workshop',
      date: '2026-02-20',
      time: '2:00 PM - 4:00 PM',
      attendees: 120,
      checkedIn: 98,
      registered: 120,
      budget: '$2000',
      status: 'Upcoming',
      progress: 60,
      location: 'Tech Hub',
      sessions: ['Intro to React', 'CSS Mastery'],
      engagement: 85,
      avgRating: 4.5,
      feedbackCount: 45,
      qrScans: 98,
    },
    {
      id: 3,
      name: 'Startup Networking',
      date: '2026-02-25',
      time: '6:00 PM - 9:00 PM',
      attendees: 180,
      checkedIn: 0,
      registered: 180,
      budget: '$3500',
      status: 'Planning 40%',
      progress: 40,
      location: 'Innovation Hub',
      sessions: ['Pitch Session', 'Networking', 'Investor Meetup'],
      engagement: 0,
      avgRating: 0,
      feedbackCount: 0,
      qrScans: 0,
    },
  ],
  analytics: {
    totalEvents: 3,
    totalAttendees: 550,
    avgEngagement: 88.5,
    totalRevenue: '$10500',
  },
};

// Navigation Function
function navigateTo(page, role = null) {
  appState.currentPage = page;
  if (role) {
    appState.userRole = role;
  }

  switch (page) {
    case 'home':
      loadHomePage();
      break;
    case 'auth':
      loadAuthPage();
      break;
    case 'organizer-dashboard':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadOrganizerDashboard();
      break;
    case 'attendee-dashboard':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadAttendeeDashboard();
      break;
    case 'attendee-schedule':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadAttendeePage('schedule');
      break;
    case 'attendee-feedback':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadAttendeePage('feedback');
      break;
    case 'attendee-certificate':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadAttendeePage('certificate');
      break;
    case 'attendee-qrcode':
      if (!appState.isLoggedIn) navigateTo('auth');
      else loadAttendeePage('qrcode');
      break;
    case 'admin-portal':
      if (!appState.isLoggedIn || appState.userRole !== 'admin') navigateTo('auth');
      else loadAdminPortal();
      break;
  }

  window.scrollTo(0, 0);
}

// Load Home Page
function loadHomePage() {
  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Seamless Event Management - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/HomePage.css">
    </head>
    <body>
        <!-- Navigation -->
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">🎯 EventFlow</div>
                <button class="nav-btn" onclick="navigateTo('auth')">Get Started</button>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">Seamless Event Management</h1>
                <p class="hero-subtitle">One platform for the entire event lifecycle: Plan → Execute → Analyze</p>

                <div class="hero-animation">
                    <div class="flow-container">
                        <div class="flow-box">📋 Plan</div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-box">🎪 Execute</div>
                        <div class="flow-arrow">→</div>
                        <div class="flow-box">📊 Analyze</div>
                    </div>
                </div>

                <div class="hero-buttons">
                    <button class="btn btn-primary" onclick="navigateTo('auth', 'organizer')">Start as Organizer</button>
                    <button class="btn btn-secondary" onclick="navigateTo('auth', 'attendee')">Find Events</button>
                </div>
            </div>
        </section>

        <!-- Live Stats -->
        <section class="stats-section">
            <div class="stat-card">
                <div class="stat-number">500+</div>
                <div class="stat-label">Events Hosted</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">50K+</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">98%</div>
                <div class="stat-label">Satisfaction Rate</div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features-section">
            <h2 class="section-title">Why Choose EventFlow?</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon-box">🎨</div>
                    <h3>Smart Event Creation</h3>
                    <p>AI-based setup with agenda suggestions & budget estimator</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-box">👥</div>
                    <h3>Personalized Dashboard</h3>
                    <p>Each attendee gets custom schedule & QR pass</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon-box">⚡</div>
                    <h3>Real-Time Tracking</h3>
                    <p>Live attendance, crowd density & analytics</p>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
            <div class="cta-content">
                <h2>Ready to Transform Event Management?</h2>
                <button class="btn btn-large" onclick="navigateTo('auth')">Get Started Now</button>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>&copy; 2026 EventFlow. All rights reserved.</p>
        </footer>

        <script src="../js/app.js"></script>
    </body>
    </html>
  `;
}

// Load Auth Page
function loadAuthPage() {
  let isLogin = true;
  let selectedRole = null;

  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/AuthPage.css">
    </head>
    <body>
        <div class="auth-page">
            <div class="auth-container">
                <button class="back-btn" onclick="navigateTo('home')">← Back</button>
                
                <div class="auth-logo">🎯 EventFlow</div>

                <div class="auth-toggle">
                    <button class="toggle-btn active" id="loginBtn" onclick="toggleAuth(true)">Login</button>
                    <button class="toggle-btn" id="signupBtn" onclick="toggleAuth(false)">Sign Up</button>
                </div>

                <div class="role-selection">
                    <p class="role-label">I am a:</p>
                    <div class="role-buttons">
                        <button class="role-btn" id="adminRole" onclick="selectRole('admin')">🛡️ Admin</button>
                        <button class="role-btn" id="organizerRole" onclick="selectRole('organizer')">🎪 Event Organizer</button>
                        <button class="role-btn" id="attendeeRole" onclick="selectRole('attendee')">👤 Attendee</button>
                    </div>
                </div>

                <form class="auth-form" onsubmit="handleAuth(event)">
                    <div id="nameField" style="display:none;" class="form-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="Your name" id="authName" />
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="your@email.com" id="authEmail" required />
                    </div>

                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" id="authPassword" required />
                    </div>

                    <button type="submit" class="btn-submit" id="submitBtn">Login</button>
                </form>

                <div class="social-login">
                    <p>Or continue with</p>
                    <div class="social-buttons">
                        <button type="button" class="social-btn">Google</button>
                        <button type="button" class="social-btn">LinkedIn</button>
                    </div>
                </div>

                <p class="auth-footer">
                    <span id="toggleText">Don't have an account?</span>
                    <button type="button" class="link-btn" id="toggleLink" onclick="toggleAuth()">Sign up</button>
                </p>
            </div>
        </div>

        <script src="../js/app.js"></script>
    </body>
    </html>
  `;

  // Reinitialize scripts
  setTimeout(() => {
    window.toggleAuth = toggleAuth;
    window.selectRole = selectRole;
    window.handleAuth = handleAuth;
  }, 0);
}

function toggleAuth(login = null) {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const submitBtn = document.getElementById('submitBtn');
  const toggleLink = document.getElementById('toggleLink');
  const toggleText = document.getElementById('toggleText');
  const nameField = document.getElementById('nameField');

  let isLogin = loginBtn.classList.contains('active');
  if (login !== null) isLogin = login;
  else isLogin = !isLogin;

  if (isLogin) {
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
    submitBtn.textContent = 'Login';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign up';
    nameField.style.display = 'none';
  } else {
    loginBtn.classList.remove('active');
    signupBtn.classList.add('active');
    submitBtn.textContent = 'Create Account';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Login';
    nameField.style.display = 'block';
  }
}

function selectRole(role) {
  appState.userRole = role;
  const adminBtn = document.getElementById('adminRole');
  const organizerBtn = document.getElementById('organizerRole');
  const attendeeBtn = document.getElementById('attendeeRole');

  // Remove active from all
  adminBtn.classList.remove('active');
  organizerBtn.classList.remove('active');
  attendeeBtn.classList.remove('active');

  // Add active to selected
  if (role === 'admin') {
    adminBtn.classList.add('active');
  } else if (role === 'organizer') {
    organizerBtn.classList.add('active');
  } else {
    attendeeBtn.classList.add('active');
  }
}

async function handleAuth(e) {
  e.preventDefault();

  if (!appState.userRole) {
    alert('Please select a role');
    return;
  }

  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const isLoginMode = document.getElementById('loginBtn').classList.contains('active');

  try {
    let result;
    if (isLoginMode) {
      // LOGIN
      result = await window.api.login({ email, password });
      if (result.success) {
        appState.isLoggedIn = true;
        appState.user = result.user;
        appState.userRole = result.user.role;
        localStorage.setItem('user', JSON.stringify(result.user));
        
        if (result.user.role === 'admin') {
          navigateTo('admin-portal');
        } else if (result.user.role === 'organizer') {
          navigateTo('organizer-dashboard');
        } else {
          navigateTo('attendee-dashboard');
        }
      } else {
        alert('❌ ' + (result.message || 'Login failed'));
      }
    } else {
      // REGISTER
      const name = document.getElementById('authName').value;
      if (!name) {
        alert('Please enter your name');
        return;
      }
      result = await window.api.register({ name, email, password, role: appState.userRole });
      if (result.success) {
        alert('✅ Account created! Please login.');
        toggleAuth(true);
      } else {
        alert('❌ ' + (result.message || 'Registration failed'));
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert('❌ Server error. Please ensure the backend is running.');
  }
}

// Load Organizer Dashboard
function loadOrganizerDashboard() {
  const totalAttendees = appState.events.reduce((sum, e) => sum + e.registered, 0);
  const totalCheckedIn = appState.events.reduce((sum, e) => sum + e.checkedIn, 0);
  const avgEngagement = (appState.events.reduce((sum, e) => sum + e.engagement, 0) / appState.events.length).toFixed(1);

  const eventHtml = appState.events.map(event => `
    <div class="event-card">
        <div class="event-header">
            <h3>${event.name}</h3>
            <span class="status-badge ${event.status.toLowerCase().includes('live') ? 'live' : ''}">${event.status}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${event.progress}%"></div>
        </div>
        <div class="event-details">
            <div class="detail-item">
                <span>📅 Date:</span> ${event.date}
            </div>
            <div class="detail-item">
                <span>👥 Registered:</span> ${event.registered}
            </div>
            <div class="detail-item">
                <span>✅ Checked-In:</span> ${event.checkedIn}
            </div>
            <div class="detail-item">
                <span>💰 Budget:</span> ${event.budget}
            </div>
            <div class="detail-item">
                <span>📊 Engagement:</span> ${event.engagement}%
            </div>
            <div class="detail-item">
                <span>⭐ Rating:</span> ${event.avgRating > 0 ? event.avgRating + '/5' : 'N/A'}
            </div>
        </div>
        <div class="event-actions">
            <button class="action-btn edit" onclick="viewEventAnalytics(${event.id})">📊 Analytics</button>
            <button class="action-btn preview" onclick="startQRScanner(${event.id})">📱 QR Check-in</button>
        </div>
    </div>
  `).join('');

  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Organizer Dashboard - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/OrganizerDashboard.css">
    </head>
    <body>
        <div class="organizer-dashboard">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="header-content">
                    <h1>🎯 Organizer Dashboard</h1>
                    <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
                </div>
            </header>

            <!-- Sidebar -->
            <div class="dashboard-sidebar">
                <nav class="sidebar-nav">
                    <div class="nav-item active">📊 Events</div>
                    <div class="nav-item" onclick="showAnalytics()">📈 Analytics</div>
                    <div class="nav-item">👥 Vendors</div>
                    <div class="nav-item">⚙️ Settings</div>
                </nav>
            </div>

            <!-- Main Content -->
            <div class="dashboard-main">
                <!-- Quick Stats -->
                <section class="quick-stats">
                    <div class="stat-box">
                        <span>📅</span>
                        <div>
                            <p class="stat-value">${appState.events.length}</p>
                            <p class="stat-label">Total Events</p>
                        </div>
                    </div>
                    <div class="stat-box">
                        <span>👥</span>
                        <div>
                            <p class="stat-value">${totalAttendees}</p>
                            <p class="stat-label">Total Registered</p>
                        </div>
                    </div>
                    <div class="stat-box">
                        <span>✅</span>
                        <div>
                            <p class="stat-value">${totalCheckedIn}</p>
                            <p class="stat-label">Checked-In</p>
                        </div>
                    </div>
                    <div class="stat-box">
                        <span>📊</span>
                        <div>
                            <p class="stat-value">${avgEngagement}%</p>
                            <p class="stat-label">Avg Engagement</p>
                        </div>
                    </div>
                </section>

                <!-- Real-Time Tracking -->
                <section class="realtime-section">
                    <h2>🔴 Real-Time Event Tracking</h2>
                    <div class="realtime-grid">
                        ${appState.events.filter(e => e.status.includes('Live')).map(event => `
                            <div class="realtime-card">
                                <h4>${event.name}</h4>
                                <div class="realtime-stats">
                                    <div class="realtime-stat">
                                        <span class="stat-icon">👥</span>
                                        <div>
                                            <p class="stat-number">${event.checkedIn}/${event.registered}</p>
                                            <p class="stat-text">Attendance</p>
                                        </div>
                                    </div>
                                    <div class="realtime-stat">
                                        <span class="stat-icon">📱</span>
                                        <div>
                                            <p class="stat-number">${event.qrScans}</p>
                                            <p class="stat-text">QR Scans</p>
                                        </div>
                                    </div>
                                    <div class="realtime-stat">
                                        <span class="stat-icon">💬</span>
                                        <div>
                                            <p class="stat-number">${event.feedbackCount}</p>
                                            <p class="stat-text">Feedback</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="engagement-bar">
                                    <div class="engagement-label">Engagement: ${event.engagement}%</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${event.engagement}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${appState.events.filter(e => e.status.includes('Live')).length === 0 ? '<p style="color:#9ca3af;">No live events currently</p>' : ''}
                    </div>
                </section>

                <!-- Events Section -->
                <section class="events-section">
                    <div class="section-header">
                        <h2>Your Events</h2>
                        <button class="btn-add" onclick="showAddEventModal()">+ Add Event</button>
                    </div>
                    <div class="events-grid">
                        ${eventHtml}
                    </div>
                </section>

                <!-- Vendor Section -->
                <section class="vendor-section">
                    <h2>Vendor Management</h2>
                    <div class="vendor-list">
                        <div class="vendor-card">
                            <h4>Catering Service</h4>
                            <p>Status: ✅ Ready</p>
                        </div>
                        <div class="vendor-card">
                            <h4>Venue Setup</h4>
                            <p>Status: ⏳ In Progress</p>
                        </div>
                        <div class="vendor-card">
                            <h4>Audio/Visual</h4>
                            <p>Status: ✅ Ready</p>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Add Event Modal -->
            <div id="addEventModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeAddEventModal()">
                <div class="modal-content">
                    <h2>Create New Event</h2>
                    <input type="text" id="eventName" placeholder="Event Name" class="modal-input" />
                    <input type="date" id="eventDate" class="modal-input" />
                    <input type="time" id="eventTime" class="modal-input" placeholder="Start Time" />
                    <input type="text" id="eventLocation" placeholder="Location" class="modal-input" />
                    <input type="number" id="eventCapacity" placeholder="Max Attendees" class="modal-input" />
                    <input type="text" id="eventBudget" placeholder="Budget (e.g., \$5000)" class="modal-input" />
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="addNewEvent()">Create Event</button>
                        <button class="btn btn-secondary" onclick="closeAddEventModal()">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- QR Scanner Modal -->
            <div id="qrScannerModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeQRScanner()">
                <div class="modal-content qr-scanner-modal">
                    <h2>📱 QR Code Check-In</h2>
                    <div class="qr-scanner-area">
                        <div class="scanner-box">
                            <div class="scan-line"></div>
                            <p>Position QR code within frame</p>
                        </div>
                    </div>
                    <div id="scanResult" class="scan-result"></div>
                    <button class="btn btn-primary" onclick="simulateQRScan()">Simulate Scan</button>
                    <button class="btn btn-secondary" onclick="closeQRScanner()">Close</button>
                </div>
            </div>

            <!-- Analytics Modal -->
            <div id="analyticsModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeAnalytics()">
                <div class="modal-content analytics-modal">
                    <h2>📊 Event Analytics</h2>
                    <div id="analyticsContent"></div>
                    <button class="btn btn-secondary" onclick="closeAnalytics()">Close</button>
                </div>
            </div>
        </div>

        <script>
            let currentEventId = null;

            function handleLogout() {
                appState.isLoggedIn = false;
                appState.userRole = null;
                appState.user = null;
                localStorage.removeItem('user');
                navigateTo('home');
            }

            function showAddEventModal() {
                document.getElementById('addEventModal').style.display = 'flex';
            }

            function closeAddEventModal() {
                document.getElementById('addEventModal').style.display = 'none';
            }

            function addNewEvent() {
                const name = document.getElementById('eventName').value;
                const date = document.getElementById('eventDate').value;
                const time = document.getElementById('eventTime').value;
                const location = document.getElementById('eventLocation').value;
                const capacity = document.getElementById('eventCapacity').value;
                const budget = document.getElementById('eventBudget').value;

                if (name && date) {
                    appState.events.push({
                        id: appState.events.length + 1,
                        name,
                        date,
                        time: time || '9:00 AM - 5:00 PM',
                        budget: budget || '\$0',
                        attendees: 0,
                        checkedIn: 0,
                        registered: parseInt(capacity) || 0,
                        status: 'Planning 0%',
                        progress: 0,
                        location: location || 'TBD',
                        sessions: [],
                        engagement: 0,
                        avgRating: 0,
                        feedbackCount: 0,
                        qrScans: 0,
                    });
                    loadOrganizerDashboard();
                }
            }

            function startQRScanner(eventId) {
                currentEventId = eventId;
                document.getElementById('qrScannerModal').style.display = 'flex';
                document.getElementById('scanResult').innerHTML = '';
            }

            function closeQRScanner() {
                document.getElementById('qrScannerModal').style.display = 'none';
                currentEventId = null;
            }

            function simulateQRScan() {
                const event = appState.events.find(e => e.id === currentEventId);
                if (event) {
                    event.checkedIn++;
                    event.qrScans++;
                    document.getElementById('scanResult').innerHTML = \`
                        <div class="success-scan">
                            ✅ Check-in successful!<br>
                            <strong>Attendee #\${event.checkedIn}</strong><br>
                            Total: \${event.checkedIn}/\${event.registered}
                        </div>
                    \`;
                    setTimeout(() => {
                        loadOrganizerDashboard();
                    }, 1500);
                }
            }

            function viewEventAnalytics(eventId) {
                const event = appState.events.find(e => e.id === eventId);
                if (event) {
                    const attendanceRate = ((event.checkedIn / event.registered) * 100).toFixed(1);
                    document.getElementById('analyticsContent').innerHTML = \`
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <h3>\${event.name}</h3>
                                <p class="analytics-date">\${event.date} | \${event.time}</p>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Registration Rate</p>
                                <p class="analytics-value">\${event.registered} attendees</p>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Check-in Rate</p>
                                <p class="analytics-value">\${attendanceRate}%</p>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: \${attendanceRate}%"></div>
                                </div>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Engagement Score</p>
                                <p class="analytics-value">\${event.engagement}%</p>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: \${event.engagement}%"></div>
                                </div>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Average Rating</p>
                                <p class="analytics-value">\${event.avgRating > 0 ? event.avgRating + '/5 ⭐' : 'No ratings yet'}</p>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Feedback Count</p>
                                <p class="analytics-value">\${event.feedbackCount} responses</p>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">QR Scans</p>
                                <p class="analytics-value">\${event.qrScans} scans</p>
                            </div>
                            <div class="analytics-card">
                                <p class="analytics-label">Budget</p>
                                <p class="analytics-value">\${event.budget}</p>
                            </div>
                        </div>
                    \`;
                    document.getElementById('analyticsModal').style.display = 'flex';
                }
            }

            function closeAnalytics() {
                document.getElementById('analyticsModal').style.display = 'none';
            }

            function showAnalytics() {
                // Global analytics view
                alert('Global Analytics Dashboard - Coming Soon!\\n\\nFeatures:\\n- Total Events\\n- Overall Engagement\\n- Revenue Reports\\n- Trend Analysis');
            }
        </script>
        <script src="../js/app.js"></script>
    </body>
    </html>
  `;
}

// Load Attendee Dashboard
function loadAttendeeDashboard() {
  const eventHtml = appState.events.map(event => `
    <div class="timeline-event">
        <div class="timeline-marker"></div>
        <div class="event-box">
            <div class="event-header">
                <h3>${event.name}</h3>
                <span class="status-badge registered">Registered</span>
            </div>
            <div class="event-info">
                <div class="info-item">🕐 ${event.time}</div>
                <div class="info-item">📍 ${event.location}</div>
            </div>
            <div class="sessions-list">
                <h4>Sessions:</h4>
                ${event.sessions.map(s => `<div class="session-item">✓ ${s}</div>`).join('')}
            </div>
            <button class="btn-view">View Details</button>
        </div>
    </div>
  `).join('');

  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendee Dashboard - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/AttendeeDashboard.css">
    </head>
    <body>
        <div class="attendee-dashboard">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="header-content">
                    <h1>👋 Welcome, Attendee!</h1>
                    <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
                </div>
            </header>

            <!-- Tabs -->
            <div class="dashboard-tabs">
                <button class="tab active" onclick="switchTab('schedule')">📅 My Schedule</button>
                <button class="tab" onclick="window.location.href='qrcode.html'">🎟️ QR Pass</button>
                <button class="tab" onclick="window.location.href='feedback.html'">💬 Feedback</button>
                <button class="tab" onclick="window.location.href='certificate.html'">🏆 Certificates</button>
                <button class="tab" onclick="window.location.href='attendee-schedule.html'" style="margin-left: auto; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">📄 View Full Schedule</button>
            </div>

            <!-- Content -->
            <div class="dashboard-content">
                <!-- Schedule Tab -->
                <div id="schedule-tab" class="tab-content">
                    <h2>Your Registered Events</h2>
                    <div class="events-timeline">
                        ${eventHtml}
                    </div>
                </div>

                <!-- QR Tab -->
                <div id="qr-tab" class="tab-content qr-section" style="display:none;">
                    <h2>Your Event Passes</h2>
                    ${appState.events.map(event => `
                        <div class="qr-card">
                            <div class="qr-header">
                                <h3>${event.name}</h3>
                                <span>🎟️</span>
                            </div>
                            <div class="qr-display">
                                <div class="qr-placeholder">📱 QR${event.id}23456</div>
                                <p class="qr-note">Show this QR code at the entrance</p>
                            </div>
                            <button class="btn-download">Download Pass</button>
                        </div>
                    `).join('')}
                </div>

                <!-- Feedback Tab -->
                <div id="feedback-tab" class="tab-content" style="display:none;">
                    <h2>Share Your Feedback</h2>
                    <div class="feedback-cards">
                        ${appState.events.map(event => `
                            <div class="feedback-card">
                                <h4>${event.name}</h4>
                                <p>Help us improve future events</p>
                                <button class="btn-feedback" onclick="showFeedbackModal()">💬 Share Feedback</button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Certificates Tab -->
                <div id="certificates-tab" class="tab-content" style="display:none;">
                    <h2>Your Certificates</h2>
                    <div class="certificates-grid">
                        <div class="cert-card">
                            <div>🏆</div>
                            <h4>Tech Summit Attendee</h4>
                            <p>Completed on Feb 15, 2026</p>
                            <button class="btn-download">Download</button>
                        </div>
                        <div class="cert-card">
                            <div>🏆</div>
                            <h4>Web Dev Workshop</h4>
                            <p>Completed on Feb 20, 2026</p>
                            <button class="btn-download">Download</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Announcements -->
            <section class="announcements">
                <div class="announcement-header">
                    <span>🔔</span>
                    <h3>Live Announcements</h3>
                </div>
                <div class="announcement-item">
                    <span class="time">2 min ago</span>
                    <p>🎤 Opening Keynote starting in 5 minutes - Room A</p>
                </div>
                <div class="announcement-item">
                    <span class="time">10 min ago</span>
                    <p>☕ Coffee break extended by 5 minutes</p>
                </div>
            </section>

            <!-- Feedback Modal -->
            <div id="feedbackModal" class="modal-overlay" style="display:none;" onclick="if(event.target === this) closeFeedbackModal()">
                <div class="modal-content feedback-modal">
                    <h2>Share Your Feedback</h2>
                    <div class="rating-input">
                        <label>Rating: <span id="ratingValue">5</span>/5</label>
                        <input type="range" min="1" max="5" value="5" id="ratingInput" onchange="updateRating(this.value)" />
                    </div>
                    <textarea class="feedback-input" placeholder="What did you think about the event?"></textarea>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="closeFeedbackModal()">Submit Feedback</button>
                        <button class="btn btn-secondary" onclick="closeFeedbackModal()">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function handleLogout() {
                appState.isLoggedIn = false;
                appState.userRole = null;
                appState.user = null;
                localStorage.removeItem('user');
                navigateTo('home');
            }
                document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
                document.getElementById(tab + '-tab').style.display = 'block';
                document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
                event.target.classList.add('active');
            }

            function showFeedbackModal() {
                document.getElementById('feedbackModal').style.display = 'flex';
            }

            function closeFeedbackModal() {
                document.getElementById('feedbackModal').style.display = 'none';
            }

            function updateRating(value) {
                document.getElementById('ratingValue').textContent = value;
            }
        </script>
        <script src="../js/app.js"></script>
    </body>
    </html>
  `;
}

// Load Attendee Pages (Schedule, Feedback, Certificate, QR Code)
async function loadAttendeePage(pageType) {
  const user = appState.user || JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.id) {
    navigateTo('auth');
    return;
  }

  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageType === 'schedule' ? 'My Schedule' : pageType === 'feedback' ? 'Event Feedback' : pageType === 'certificate' ? 'Certificate' : 'QR Pass'} - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/AttendeeDashboard.css">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .back-link { color: white; text-decoration: none; font-size: 14px; margin-bottom: 20px; cursor: pointer; }
            .back-link:hover { text-decoration: underline; }
            .page-header { color: white; margin-bottom: 30px; }
            .page-header h2 { margin: 0; font-size: 28px; }
            .logout-btn { background: #ef4444 !important; color: white !important; border: none !important; }
        </style>
    </head>
    <body>
        <div class="container">
            <a class="back-link" onclick="navigateTo('attendee-dashboard')">← Back to Dashboard</a>
            <div id="pageContent">
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">⏳</div>
                    <p style="color: white; font-size: 14px;">Loading page...</p>
                </div>
            </div>
        </div>
        <script src="../js/api.js"></script>
        <script>
            const user = ${JSON.stringify(user)};
            const appState = { user, isLoggedIn: true, userRole: 'attendee' };

            async function renderPage() {
                try {
                    if ('${pageType}' === 'schedule') {
                        await renderSchedule();
                    } else if ('${pageType}' === 'feedback') {
                        await renderFeedback();
                    } else if ('${pageType}' === 'certificate') {
                        await renderCertificate();
                    } else if ('${pageType}' === 'qrcode') {
                        await renderQRCode();
                    }
                } catch (error) {
                    console.error('Error rendering page:', error);
                    document.getElementById('pageContent').innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Error Loading Page</div></div>';
                }
            }

            async function renderSchedule() {
                const result = await window.api.getMySchedule(user.id);
                let html = '<h2 class="page-header">📅 My Schedule</h2><div class="filter-buttons" style="margin-bottom: 20px;">';
                html += '<button class="filter-btn active" onclick="filterSchedule(\\'all\\')">All Events</button>';
                html += '<button class="filter-btn" onclick="filterSchedule(\\'Live\\')">Live</button>';
                html += '<button class="filter-btn" onclick="filterSchedule(\\'Upcoming\\')">Upcoming</button>';
                html += '<button class="filter-btn" onclick="filterSchedule(\\'Completed\\')">Completed</button>';
                html += '<button class="logout-btn" onclick="logout()" style="margin-left: auto;">🚪 Logout</button></div>';

                if (result.success && result.schedule.length > 0) {
                    html += '<div class="schedule-grid">';
                    result.schedule.forEach(event => {
                        html += \`<div class="event-schedule-card \${event.status.toLowerCase()}">
                            <h3 class="event-title">\${event.title}</h3>
                            <div class="event-meta">📅 \${new Date(event.date).toLocaleDateString()}</div>
                            <div class="event-meta">🕐 \${event.time}</div>
                            <div class="event-meta">📍 \${event.location}</div>
                            <div style="margin: 15px 0;">
                                <span class="status-badge \${event.status.toLowerCase()}">\${event.status}</span>
                                \${event.checked_in_status ? '<span class="check-in-badge">✅ Checked In</span>' : ''}
                            </div>
                            <div class="event-actions">
                                <button class="action-btn primary" onclick="goToQR(\${event.id})">🎟️ QR Code</button>
                                \${event.status === 'Completed' ? \`<button class="action-btn primary" onclick="goToCert(\${event.id})">🏆 Certificate</button>\` : ''}
                                <button class="action-btn secondary" onclick="goToFeedback(\${event.id})">💬 Feedback</button>
                            </div>
                        </div>\`;
                    });
                    html += '</div>';
                } else {
                    html += '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No Events Registered</div></div>';
                }

                document.getElementById('pageContent').innerHTML = html;
            }

            async function renderFeedback() {
                const result = await window.api.getMyFeedback(user.id);
                let html = '<h2 class="page-header">💬 Share Your Feedback</h2>';

                if (result.success && result.feedback.length > 0) {
                    html += '<button class="logout-btn" onclick="logout()" style="float: right;">🚪 Logout</button><div style="clear: both;"></div>';
                    result.feedback.forEach(item => {
                        html += \`<div class="feedback-item \${item.has_feedback ? '' : 'no-feedback'}">
                            <div class="feedback-header">
                                <div>
                                    <div class="event-name">\${item.event_title}</div>
                                    <div class="event-date-small">\${new Date(item.event_date).toLocaleDateString()}</div>
                                </div>
                                \${item.has_feedback ? \`<div style="font-size: 24px; color: #fbbf24;">\${'⭐'.repeat(item.rating)}</div>\` : ''}
                            </div>
                            \${item.has_feedback ? \`
                                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                                    <p style="color: #1f2937; line-height: 1.6; margin: 0;">\${item.comment || 'No comment'}</p>
                                </div>
                                <button class="action-btn secondary" onclick="openFeedbackForm(\${item.event_id}, '\${item.event_title}', \${item.rating}, '\${(item.comment || '').replace(/'/g, "\\\\'")}')">✏️ Edit</button>
                            \` : \`
                                <button class="action-btn primary" onclick="openFeedbackForm(\${item.event_id}, '\${item.event_title}', 5, '')">💬 Add Feedback</button>
                            \`}
                        </div>\`;
                    });
                } else {
                    html += '<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">No Events to Rate</div></div>';
                }

                document.getElementById('pageContent').innerHTML = html;
            }

            async function renderCertificate() {
                const eventId = new URLSearchParams(window.location.search).get('eventId');
                if (!eventId) {
                    document.getElementById('pageContent').innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">Select an event to view certificate</div></div>';
                    return;
                }

                const result = await window.api.getCertificate(user.id, eventId);
                let html = '<h2 class="page-header">🏆 Certificate of Attendance</h2>';
                html += '<button class="logout-btn" onclick="logout()" style="float: right;">🚪 Logout</button><div style="clear: both;"></div>';

                if (result.success) {
                    const cert = result.certificate;
                    html += \`<div class="certificate-card">
                        <div class="certificate-preview">
                            <div class="certificate-content">
                                <div class="certificate-header">Certificate of Attendance</div>
                                <div class="certificate-title">🏆</div>
                                <div class="certificate-line"></div>
                                <div class="certificate-text">This is proudly presented to</div>
                                <div class="certificate-name">\${cert.attendee_name}</div>
                                <div class="certificate-text">for successfully attending</div>
                                <div class="certificate-event">\${cert.event_title}</div>
                                <div class="certificate-text">on \${cert.event_date}</div>
                                <div class="certificate-line"></div>
                                <div style="text-align: center; font-size: 12px; opacity: 0.9;">
                                    Cert # \${cert.certificate_number.substring(cert.certificate_number.length - 8)}<br>
                                    Issued: \${cert.issue_date}
                                </div>
                            </div>
                        </div>
                        <div class="certificate-info">
                            <div class="info-row"><span class="info-label">Event:</span><span class="info-value">\${cert.event_title}</span></div>
                            <div class="info-row"><span class="info-label">Attendee:</span><span class="info-value">\${cert.attendee_name}</span></div>
                            <div class="info-row"><span class="info-label">Date:</span><span class="info-value">\${cert.event_date}</span></div>
                            <div class="info-row"><span class="info-label">Organizer:</span><span class="info-value">\${cert.organizer_name}</span></div>
                        </div>
                        <div class="certificate-actions">
                            <button class="btn-download" onclick="window.print()">🖨️ Print</button>
                            <button class="btn-share" onclick="alert('Certificate shared!')">📤 Share</button>
                        </div>
                    </div>\`;
                } else {
                    html += '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">' + result.message + '</div></div>';
                }

                document.getElementById('pageContent').innerHTML = html;
            }

            async function renderQRCode() {
                const eventId = new URLSearchParams(window.location.search).get('eventId');
                if (!eventId) {
                    document.getElementById('pageContent').innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">Select an event to view QR code</div></div>';
                    return;
                }

                const result = await window.api.getQRCode(user.id, eventId);
                let html = '<h2 class="page-header">🎟️ Event Pass</h2>';
                html += '<button class="logout-btn" onclick="logout()" style="float: right;">🚪 Logout</button><div style="clear: both;"></div>';

                if (result.success) {
                    html += \`<div class="qr-card">
                        <div class="qr-header"><h3>\${result.event_title}</h3></div>
                        <div class="qr-display">
                            <div style="text-align: center; font-size: 24px; letter-spacing: 4px; margin: 20px 0; font-family: monospace; word-break: break-all;">\${result.qr_code}</div>
                            <p style="text-align: center; color: #6b7280; font-size: 13px;">Show at entrance</p>
                        </div>
                        <div class="qr-info">
                            <div class="qr-info-row"><span style="font-weight: 600; color: #6b7280;">Event:</span><span>\${result.event_title}</span></div>
                            <div class="qr-info-row"><span style="font-weight: 600; color: #6b7280;">Date:</span><span>\${new Date(result.event_date).toLocaleDateString()}</span></div>
                            <div class="qr-info-row"><span style="font-weight: 600; color: #6b7280;">Attendee:</span><span>\${result.attendee_name}</span></div>
                        </div>
                        <div class="qr-actions">
                            <button class="btn-print" onclick="window.print()">🖨️ Print</button>
                            <button class="btn-save" onclick="alert('QR code saved!')">⬇️ Save</button>
                        </div>
                    </div>\`;
                } else {
                    html += '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">' + result.message + '</div></div>';
                }

                document.getElementById('pageContent').innerHTML = html;
            }

            function goToQR(eventId) {
                navigateTo('attendee-qrcode');
            }

            function goToCert(eventId) {
                navigateTo('attendee-certificate');
            }

            function goToFeedback(eventId) {
                navigateTo('attendee-feedback');
            }

            function openFeedbackForm(eventId, eventTitle, rating, comment) {
                const newRating = prompt('Rate this event (1-5):', rating);
                if (newRating) {
                    const newComment = prompt('Your feedback:', comment);
                    if (newRating && newComment !== null) {
                        window.api.submitFeedback(user.id, eventId, newRating, newComment).then(result => {
                            if (result.success) {
                                alert('✅ Thank you for your feedback!');
                                renderFeedback();
                            }
                        });
                    }
                }
            }

            function filterSchedule(filter) {
                event.target.parentElement.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                renderSchedule();
            }

            function logout() {
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }

            // Expose for navigation
            window.navigateTo = function(page) {
                if (page === 'attendee-dashboard') {
                    window.location.href = 'index.html';
                    setTimeout(() => appState.currentPage = 'attendee-dashboard', 100);
                } else {
                    window.location.href = 'index.html?page=' + page;
                }
            };

            renderPage();
        </script>
    </body>
    </html>
  `;
}

// Load Admin Portal
async function loadAdminPortal() {
  // Fetch admin dashboard stats
  let stats = null;
  try {
    const result = await window.api.getAdminDashboard();
    if (result.success) {
      stats = result.stats;
    }
  } catch (error) {
    console.error('Failed to load admin stats:', error);
  }

  // Use mock data if API call fails
  if (!stats) {
    stats = {
      overview: {
        totalUsers: 156,
        totalEvents: 42,
        totalRegistrations: 1248,
        totalAttendance: 987,
        totalFeedback: 324,
        avgRating: '4.65',
        totalRevenue: '$62,400'
      },
      usersByRole: [
        { role: 'organizer', count: 28 },
        { role: 'attendee', count: 128 }
      ],
      eventsByStatus: [
        { status: 'Live', count: 8 },
        { status: 'Upcoming', count: 15 },
        { status: 'Planning', count: 12 },
        { status: 'Completed', count: 7 }
      ],
      growth: {
        newUsersLast30Days: 45,
        newEventsLast30Days: 12
      },
      recentActivities: [
        { user_name: 'John Doe', action: 'event_registration', event_name: 'Tech Summit 2026', timestamp: '2026-02-03 10:30:00' },
        { user_name: 'Jane Smith', action: 'qr_checkin', event_name: 'Web Dev Workshop', timestamp: '2026-02-03 10:15:00' },
        { user_name: 'Alice Johnson', action: 'feedback_submission', event_name: 'Startup Networking', timestamp: '2026-02-03 09:45:00' }
      ]
    };
  }

  document.body.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Portal - EventFlow</title>
        <link rel="stylesheet" href="../styles/globals.css">
        <link rel="stylesheet" href="../styles/AdminPortal.css">
    </head>
    <body>
        <div class="admin-portal">
            <!-- Header -->
            <div class="admin-header">
                <h1>🛡️ Admin Portal</h1>
                <div class="admin-nav">
                    <button class="admin-nav-btn active" onclick="showAdminSection('overview')">Overview</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('users')">Users</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('events')">Events</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('analytics')">Analytics</button>
                    <button class="admin-nav-btn" onclick="showAdminSection('reports')">Reports</button>
                    <button class="admin-nav-btn" onclick="logout()" style="background: linear-gradient(135deg, #ef4444, #dc2626);">Logout</button>
                </div>
            </div>

            <!-- Overview Section -->
            <div id="overview-section" class="admin-section">
                <!-- Stats Grid -->
                <div class="admin-stats-grid">
                    <div class="stat-card">
                        <h3>Total Users</h3>
                        <div class="stat-value">${stats.overview.totalUsers}</div>
                        <div class="stat-change">↗ ${stats.growth.newUsersLast30Days} new (30 days)</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Events</h3>
                        <div class="stat-value">${stats.overview.totalEvents}</div>
                        <div class="stat-change">↗ ${stats.growth.newEventsLast30Days} new (30 days)</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Registrations</h3>
                        <div class="stat-value">${stats.overview.totalRegistrations}</div>
                        <div class="stat-change">📝 Active signups</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Attendance</h3>
                        <div class="stat-value">${stats.overview.totalAttendance}</div>
                        <div class="stat-change">✅ Check-ins</div>
                    </div>
                    <div class="stat-card">
                        <h3>Average Rating</h3>
                        <div class="stat-value">${stats.overview.avgRating}</div>
                        <div class="stat-change">⭐ Out of 5.00</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Revenue</h3>
                        <div class="stat-value">${stats.overview.totalRevenue}</div>
                        <div class="stat-change">💰 Estimated</div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="admin-content">
                    <h2>Recent Activity</h2>
                    <div class="activity-log">
                        ${stats.recentActivities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                                <div>
                                    <span class="activity-user">${activity.user_name}</span>
                                    <span class="activity-action"> ${activity.action.replace('_', ' ')} - ${activity.event_name || 'System'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Users Section -->
            <div id="users-section" class="admin-section" style="display:none;">
                <div class="admin-content">
                    <h2>User Management</h2>
                    <div class="filter-section">
                        <input type="text" class="filter-input" placeholder="Search users by name or email..." id="userSearch">
                        <select class="filter-select" id="roleFilter">
                            <option value="">All Roles</option>
                            <option value="organizer">Organizers</option>
                            <option value="attendee">Attendees</option>
                        </select>
                        <button class="admin-nav-btn" onclick="loadUsers()">Search</button>
                    </div>
                    <div id="usersTable"></div>
                </div>
            </div>

            <!-- Events Section -->
            <div id="events-section" class="admin-section" style="display:none;">
                <div class="admin-content">
                    <h2>Event Management</h2>
                    <div class="filter-section">
                        <input type="text" class="filter-input" placeholder="Search events..." id="eventSearch">
                        <select class="filter-select" id="statusFilter">
                            <option value="">All Status</option>
                            <option value="Live">Live</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Planning">Planning</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <button class="admin-nav-btn" onclick="loadEvents()">Search</button>
                    </div>
                    <div id="eventsTable"></div>
                </div>
            </div>

            <!-- Analytics Section -->
            <div id="analytics-section" class="admin-section" style="display:none;">
                <div class="admin-content">
                    <h2>System Analytics</h2>
                    <div class="charts-grid">
                        <div class="chart-card">
                            <h3>Users by Role</h3>
                            <div style="padding: 20px;">
                                ${stats.usersByRole.map(item => `
                                    <div style="margin-bottom: 15px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                            <span class="badge ${item.role}">${item.role}</span>
                                            <strong>${item.count}</strong>
                                        </div>
                                        <div style="background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100%; width: ${(item.count / stats.overview.totalUsers * 100)}%;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="chart-card">
                            <h3>Events by Status</h3>
                            <div style="padding: 20px;">
                                ${stats.eventsByStatus.map(item => `
                                    <div style="margin-bottom: 15px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                            <span class="badge ${item.status.toLowerCase()}">${item.status}</span>
                                            <strong>${item.count}</strong>
                                        </div>
                                        <div style="background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); height: 100%; width: ${(item.count / stats.overview.totalEvents * 100)}%;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reports Section -->
            <div id="reports-section" class="admin-section" style="display:none;">
                <div class="admin-content">
                    <h2>Generate Reports</h2>
                    <div class="admin-form" style="max-width: 600px;">
                        <div class="form-group">
                            <label>Report Type</label>
                            <select id="reportType" class="filter-select" style="width: 100%;">
                                <option value="user-activity">User Activity Report</option>
                                <option value="event-performance">Event Performance Report</option>
                                <option value="revenue">Revenue Report</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="date" id="reportStartDate" class="filter-input">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="date" id="reportEndDate" class="filter-input">
                        </div>
                        <button class="form-submit" onclick="generateReport()">Generate Report</button>
                    </div>
                    <div id="reportResults" style="margin-top: 30px;"></div>
                </div>
            </div>
        </div>

        <script src="../js/api.js"></script>
        <script>
            // Admin Section Navigation
            function showAdminSection(section) {
                document.querySelectorAll('.admin-section').forEach(el => el.style.display = 'none');
                document.getElementById(section + '-section').style.display = 'block';
                
                document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                // Load data for the section
                if (section === 'users') loadUsers();
                if (section === 'events') loadEvents();
            }

            // Load Users
            async function loadUsers() {
                const search = document.getElementById('userSearch').value;
                const role = document.getElementById('roleFilter').value;
                
                try {
                    const result = await window.api.getAllUsersAdmin({ search, role });
                    
                    if (result.success) {
                        const table = \`
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${result.users.map(user => \`
                                        <tr>
                                            <td>\${user.id}</td>
                                            <td>\${user.name}</td>
                                            <td>\${user.email}</td>
                                            <td><span class="badge \${user.role}">\${user.role}</span></td>
                                            <td>\${new Date(user.created_at).toLocaleDateString()}</td>
                                            <td class="action-btns">
                                                <button class="action-btn edit" onclick="editUser(\${user.id})">Edit</button>
                                                <button class="action-btn delete" onclick="deleteUser(\${user.id})">Delete</button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        \`;
                        document.getElementById('usersTable').innerHTML = table;
                    }
                } catch (error) {
                    console.error('Failed to load users:', error);
                    document.getElementById('usersTable').innerHTML = '<p>Failed to load users. Using mock data.</p>';
                }
            }

            // Load Events
            async function loadEvents() {
                const search = document.getElementById('eventSearch').value;
                const status = document.getElementById('statusFilter').value;
                
                try {
                    const result = await window.api.getAllEventsAdmin({ search, status });
                    
                    if (result.success) {
                        const table = \`
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Organizer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    \${result.events.map(event => \`
                                        <tr>
                                            <td>\${event.id}</td>
                                            <td>\${event.title}</td>
                                            <td>\${event.organizer_name}</td>
                                            <td>\${new Date(event.date).toLocaleDateString()}</td>
                                            <td><span class="badge \${event.status.toLowerCase()}">\${event.status}</span></td>
                                            <td>\${event.registered}</td>
                                            <td class="action-btns">
                                                <button class="action-btn approve" onclick="approveEvent(\${event.id})">Approve</button>
                                                <button class="action-btn delete" onclick="deleteEvent(\${event.id})">Delete</button>
                                            </td>
                                        </tr>
                                    \`).join('')}
                                </tbody>
                            </table>
                        \`;
                        document.getElementById('eventsTable').innerHTML = table;
                    }
                } catch (error) {
                    console.error('Failed to load events:', error);
                }
            }

            // User Actions
            async function editUser(userId) {
                const newRole = prompt('Enter new role (organizer/attendee):');
                if (newRole) {
                    const result = await window.api.updateUserAdmin(userId, { role: newRole });
                    if (result.success) {
                        alert('User updated successfully!');
                        loadUsers();
                    }
                }
            }

            async function deleteUser(userId) {
                if (confirm('Are you sure you want to delete this user?')) {
                    const result = await window.api.deleteUserAdmin(userId);
                    if (result.success) {
                        alert('User deleted successfully!');
                        loadUsers();
                    }
                }
            }

            // Event Actions
            async function approveEvent(eventId) {
                const result = await window.api.approveEventAdmin(eventId);
                if (result.success) {
                    alert('Event approved!');
                    loadEvents();
                }
            }

            async function deleteEvent(eventId) {
                if (confirm('Are you sure you want to delete this event?')) {
                    const result = await window.api.deleteEventAdmin(eventId);
                    if (result.success) {
                        alert('Event deleted!');
                        loadEvents();
                    }
                }
            }

            // Generate Report
            async function generateReport() {
                const type = document.getElementById('reportType').value;
                const startDate = document.getElementById('reportStartDate').value;
                const endDate = document.getElementById('reportEndDate').value;
                
                document.getElementById('reportResults').innerHTML = '<div class="loading"><div class="spinner"></div></div>';
                
                try {
                    const result = await window.api.generateReport(type, startDate, endDate);
                    
                    if (result.success && result.report.data) {
                        let html = '<table class="admin-table"><thead><tr>';
                        
                        // Generate table headers from first row
                        const headers = Object.keys(result.report.data[0]);
                        headers.forEach(header => {
                            html += \`<th>\${header.replace('_', ' ').toUpperCase()}</th>\`;
                        });
                        html += '</tr></thead><tbody>';
                        
                        // Generate table rows
                        result.report.data.forEach(row => {
                            html += '<tr>';
                            headers.forEach(header => {
                                html += \`<td>\${row[header]}</td>\`;
                            });
                            html += '</tr>';
                        });
                        html += '</tbody></table>';
                        
                        document.getElementById('reportResults').innerHTML = html;
                    } else {
                        document.getElementById('reportResults').innerHTML = '<p>No data available for this report.</p>';
                    }
                } catch (error) {
                    console.error('Failed to generate report:', error);
                    document.getElementById('reportResults').innerHTML = '<p>Failed to generate report.</p>';
                }
            }

            function logout() {
                localStorage.removeItem('user');
                appState.isLoggedIn = false;
                appState.userRole = null;
                appState.user = null;
                navigateTo('home');
            }
        </script>
    </body>
    </html>
  `;
}

// Initialize
navigateTo('home');
