import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/AdminPortal.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showUserCreateForm, setShowUserCreateForm] = useState(false)
  const [showEventCreateForm, setShowEventCreateForm] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalAttendees: 0
  })

  // User form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendee'
  })

  // Event form
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    category: 'General'
  })

  // Users and Events lists
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in and is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id || user.role !== 'admin') {
      navigate('/auth')
      return
    }

    // Load initial data
    loadStats()
    loadUsers()
    loadEvents()
  }, [navigate])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      if (data.success && data.stats) {
        setStats({
          totalUsers: data.stats.overview?.totalUsers || 0,
          totalEvents: data.stats.overview?.totalEvents || 0,
          totalAttendees: data.stats.overview?.totalRegistrations || 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      const data = await response.json()
      if (data.success) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      })

      const data = await response.json()
      if (data.success) {
        showMessage('User created successfully!', 'success')
        setUserForm({ name: '', email: '', password: '', role: 'attendee' })
        loadUsers()
        loadStats()
      } else {
        showMessage(data.message || 'Failed to create user', 'error')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      showMessage('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const admin = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          organizer_id: admin.id,
          capacity: parseInt(eventForm.capacity) || 0
        })
      })

      const data = await response.json()
      if (data.success) {
        showMessage('Event created successfully!', 'success')
        setEventForm({ 
          title: '', description: '', date: '', time: '', 
          location: '', capacity: '', category: 'General' 
        })
        loadEvents()
        loadStats()
      } else {
        showMessage(data.message || 'Failed to create event', 'error')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      showMessage('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        showMessage('User deleted successfully!', 'success')
        loadUsers()
        loadStats()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Event deleted successfully!', 'success')
        loadEvents()
        loadStats()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth')
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>🎯 EventFlow - Admin Portal</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
      </header>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎟️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalAttendees}</div>
            <div className="stat-label">Total Attendees</div>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 View Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎪 View Events
        </button>
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2>📊 Admin Dashboard</h2>
            <p>Welcome to the EventFlow Admin Portal. Use the tabs above to manage users and events.</p>
            <div className="dashboard-info">
              <div className="info-card">
                <h3>👥 User Management</h3>
                <p>Create, view, and delete user accounts. Assign roles: Admin, Organizer, or Attendee.</p>
              </div>
              <div className="info-card">
                <h3>🎪 Event Management</h3>
                <p>Create, view, and manage events. Track registrations and attendance.</p>
              </div>
              <div className="info-card">
                <h3>📈 Analytics</h3>
                <p>Monitor system-wide statistics including users, events, and attendance.</p>
              </div>
            </div>
          </div>
        )}

        {/* View Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="tab-header-row">
              <h2>👥 All Users ({users.length})</h2>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowUserCreateForm((prev) => !prev)}
              >
                {showUserCreateForm ? 'Cancel' : 'Add User'}
              </button>
            </div>

            {showUserCreateForm && (
              <form onSubmit={handleCreateUser} className="admin-form inline-create-form">
                <div className="form-group">
                  <label htmlFor="user-name">Full Name *</label>
                  <input
                    id="user-name"
                    type="text"
                    placeholder="Enter user's full name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-email">Email Address *</label>
                  <input
                    id="user-email"
                    type="email"
                    placeholder="Enter user's email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-password">Password *</label>
                  <input
                    id="user-password"
                    type="password"
                    placeholder="Enter user's password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-role">Role *</label>
                  <select
                    id="user-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="attendee">Attendee</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </form>
            )}

            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View Events Tab */}
        {activeTab === 'events' && (
          <div className="tab-content">
            <div className="tab-header-row">
              <h2>🎪 All Events ({events.length})</h2>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowEventCreateForm((prev) => !prev)}
              >
                {showEventCreateForm ? 'Cancel' : 'Add Event'}
              </button>
            </div>

            {showEventCreateForm && (
              <form onSubmit={handleCreateEvent} className="admin-form inline-create-form">
                <div className="form-group">
                  <label htmlFor="event-title">Event Title *</label>
                  <input
                    id="event-title"
                    type="text"
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="event-description">Description</label>
                  <textarea
                    id="event-description"
                    placeholder="Enter event description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="event-date">Date *</label>
                    <input
                      id="event-date"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="event-time">Time</label>
                    <input
                      id="event-time"
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="event-location">Location</label>
                  <input
                    id="event-location"
                    type="text"
                    placeholder="Enter event location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="event-capacity">Capacity</label>
                    <input
                      id="event-capacity"
                      type="number"
                      placeholder="Enter max attendees"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="event-category">Category</label>
                    <select
                      id="event-category"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    >
                      <option value="General">General</option>
                      <option value="Tech">Tech</option>
                      <option value="Business">Business</option>
                      <option value="Social">Social</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </form>
            )}

            {events.length === 0 ? (
              <p>No events found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Organizer</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>{event.id}</td>
                        <td>{event.title}</td>
                        <td>{event.organizer_name || 'N/A'}</td>
                        <td>{event.date}</td>
                        <td>{event.location || 'N/A'}</td>
                        <td>{event.capacity || 'Unlimited'}</td>
                        <td><span className={`status-badge status-${event.status}`}>{event.status}</span></td>
                        <td>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
