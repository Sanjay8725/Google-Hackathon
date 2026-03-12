import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import AuthPage from './components/AuthPage'
import AdminDashboard from './components/admin/AdminDashboard'
import AttendeeDashboard from './components/attendee/AttendeeDashboard'
import OrganizerDashboard from './components/organizer/OrganizerDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/attendee" element={<AttendeeDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
