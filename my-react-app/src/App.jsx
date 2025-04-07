import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminNotification from './pages/AdminNotification';
import AdminViewReports from './pages/AdminViewReports';
import BookingForm from './pages/BookingForm';

const App = () => {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      {/* Routes for different pages */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/AdminNotification" element={<AdminNotification />} />
        <Route path="/admin-reports" element={<AdminViewReports />} />
      </Routes>

      {/* Booking Form Component 
      <BookingForm />  */}
    </div>
  );
};

export default App;
