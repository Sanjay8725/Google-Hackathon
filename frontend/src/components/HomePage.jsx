import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/HomePage.css'
import '../styles/animations.css'

function HomePage() {
  const navigate = useNavigate()

  const goToAuth = (role = '') => {
    navigate('/auth', { state: { role } })
  }

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">🎯 EventFlow</div>
          <button className="nav-btn" onClick={() => goToAuth()}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Seamless Event Management</h1>
          <p className="hero-subtitle">One platform for the entire event lifecycle: Plan → Execute → Analyze</p>

          <div className="hero-animation">
            <div className="flow-container">
              <div className="flow-box">📋 Plan</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">🎪 Execute</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box">📊 Analyze</div>
            </div>
          </div>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => goToAuth('organizer')}>
              Start as Organizer
            </button>
            <button className="btn btn-secondary" onClick={() => goToAuth('attendee')}>
              Find Events
            </button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-number">500+</div>
          <div className="stat-label">Events Hosted</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">50K+</div>
          <div className="stat-label">Attendees</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">98%</div>
          <div className="stat-label">Satisfaction</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose EventFlow?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Attendee Portal</h3>
            <p>Register, check-in with QR codes, access schedules & certificates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎪</div>
            <h3>Organizer Dashboard</h3>
            <p>Create events, manage attendees, track real-time analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Admin Control</h3>
            <p>Manage users, oversee all events, comprehensive system analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Live attendance tracking, feedback analysis, actionable insights</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 EventFlow. Built for seamless event experiences.</p>
      </footer>
    </div>
  )
}

export default HomePage
