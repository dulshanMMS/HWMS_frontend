import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminNotification from './pages/AdminNotification'
import AdminViewReports from './pages/AdminViewReports'

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/AdminNotification" element={<AdminNotification />} />
        <Route path="/admin-reports" element={<AdminViewReports />} />
    </Routes>
  )
}

export default App