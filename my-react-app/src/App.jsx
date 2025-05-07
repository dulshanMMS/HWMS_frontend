import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminNotification from "./pages/AdminNotification";
import AdminViewReports from "./pages/AdminViewReports";
import BookingHistory from "./pages/BookingHistory";
import ParkingBooking from "./pages/ParkingBooking";
import AdminParking from "./pages/AdminParking";
import Profile from "./pages/Profile";

const App = () => {
  const location = useLocation();

  // List of routes that need simple green background (without center)
  const greenPages = ["/user/parking-booking","/history"];

  // Check if current page matches
  const isSimpleGreenPage = greenPages.includes(location.pathname);

  const containerClass = isSimpleGreenPage
    ? "min-h-screen bg-green-100"
    : "min-h-screen bg-green-100 flex items-center justify-center";

  return (
    <div className={containerClass}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/AdminNotification" element={<AdminNotification />} />
        <Route path="/admin-reports" element={<AdminViewReports />} />
        <Route path="/history" element={<BookingHistory />} />
        <Route path="/user/parking-booking" element={<ParkingBooking />} />
        <Route path="admin/adminparking" element={<AdminParking />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

export default App;
