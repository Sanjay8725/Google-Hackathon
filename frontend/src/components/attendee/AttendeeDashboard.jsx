import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/AttendeeDashboard.css'

function AttendeeDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)

  const pageSize = 6

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!storedUser.id) {
      navigate('/auth')
      return
    }
    setUser(storedUser)
    loadEvents()
  }, [navigate])

  const loadEvents = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setEvents(data.events || [])
      } else {
        setError(data.message || 'Failed to load events.')
      }
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Unable to fetch events. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const unique = new Set(events.map((event) => event.category).filter(Boolean))
    return ['all', ...Array.from(unique)]
  }, [events])

  const filteredEvents = useMemo(() => {
    const text = query.trim().toLowerCase()

    return events.filter((event) => {
      const title = (event.title || event.name || '').toLowerCase()
      const location = (event.location || '').toLowerCase()
      const category = (event.category || '').toLowerCase()

      const matchText = !text || title.includes(text) || location.includes(text)
      const matchCategory = categoryFilter === 'all' || category === categoryFilter.toLowerCase()

      return matchText && matchCategory
    })
  }, [events, query, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [query, categoryFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handleRegister = async (eventId) => {
    setNotice('')

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: user.id, ticket_type: 'General' })
      })
      const data = await response.json()

      if (data.success) {
        setNotice('Registration successful. Your QR code is ready in your attendee module.')
        await loadEvents()
      } else {
        setNotice(data.message || 'Registration failed.')
      }
    } catch (registerError) {
      console.error('Registration error:', registerError)
      setNotice('Unable to register right now. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth')
  }

  return (
    <div className="attendee-dashboard">
      <header className="dashboard-header">
        <h1>🎯 EventFlow - Attendee Portal</h1>
        <div className="header-actions">
          <span>Welcome, {user?.username}!</span>
          <button onClick={loadEvents} className="btn btn-secondary">Refresh</button>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <h2>Available Events</h2>
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events by title or location"
          />
          <select className="status-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="list-message">Loading events...</p>}
        {error && <p className="list-message error">{error}</p>}
        {notice && <p className="list-message notice">{notice}</p>}

        <div className="events-grid">
          {!loading && pagedEvents.length === 0 ? (
            <p>No events available at the moment.</p>
          ) : (
            pagedEvents.map(event => (
              <div key={event.id} className="event-card">
                <h3>{event.title || event.name}</h3>
                <p>{event.description}</p>
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
                <p>🏷️ {event.category || 'General'}</p>
                <button className="btn btn-primary" onClick={() => handleRegister(event.id)}>
                  Register
                </button>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendeeDashboard
