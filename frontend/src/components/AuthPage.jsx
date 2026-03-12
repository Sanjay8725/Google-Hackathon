import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/AuthPage.css'

async function login(usernameOrEmail, password, role) {
  try {
    const response = await fetch(`/api/auth/login/${role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    })

    return await response.json()
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' }
  }
}

async function register(name, username, email, password, role) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, role })
    })

    return await response.json()
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' }
  }
}

function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState(location.state?.role || 'attendee')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const result = await login(formData.username, formData.password, role)
        if (result.success) {
          localStorage.setItem('user', JSON.stringify(result.user))

          // Navigate based on role
          const userRole = result.user.role
          if (userRole === 'admin') navigate('/admin')
          else if (userRole === 'organizer') navigate('/organizer')
          else navigate('/attendee')
        } else {
          setError(result.message || 'Login failed')
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        const result = await register(
          formData.username,
          formData.username,
          formData.email,
          formData.password,
          role
        )
        if (result.success) {
          setError('')
          setIsLogin(true)
          setFormData({ username: '', email: '', password: '', confirmPassword: '' })
        } else {
          setError(result.message || 'Registration failed')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">🎯 EventFlow</h1>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="your.email@example.com"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Confirm your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required={!isLogin}
                >
                  <option value="attendee">Attendee</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-footer">
          <button className="link-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
