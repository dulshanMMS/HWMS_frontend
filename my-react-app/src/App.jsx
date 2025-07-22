import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ParkingHistory from "./pages/ParkingHistory";
import HomePage from './pages/HomePage';
import AdminDashboard from "./pages/AdminDashboard";
import AdminNotification from "./pages/AdminNotification";
import AdminParking from "./pages/AdminParking";
import AdminViewReports from "./pages/AdminViewReports";
import AdminTeamManagement from "./pages/AdminTeamManagement";

import AboutUsPage from "./pages/AboutUsPage";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import SeatHistory from "./pages/SeatHistory";
import BookingPage from './pages/DateBooking';
import FloorLayout from './pages/FloorLayout';
import ParkingBooking from "./pages/ParkingBooking";
import ResetPassword from "./pages/ResetPassword";
import UserDashboard from "./pages/UserDashboard";
import UserNotification from "./pages/UserNotification";

import Profile from "./pages/Profile";
import MessagingPage from "./pages/MessagingPage";

const App = () => {
  const location = useLocation();

  // List of routes that need simple green background (without center)
  const greenPages = ["/user/parking-booking", "/history", "/about/us", "/admin"]; //  "/history"

  // Check if current page matches

  const isSimpleGreenPage = greenPages.includes(location.pathname);

  const containerClass = isSimpleGreenPage
    ? "min-h-screen bg-green-100"
    : "min-h-screen bg-green-100 flex items-center justify-center";

  return (
    <div className={containerClass}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/datebooking" element={<BookingPage />} />
        <Route path="/floorlayout" element={<FloorLayout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/AdminNotification" element={<AdminNotification />} />
        <Route path="/admin-reports" element={<AdminViewReports />} />
        <Route path="/parkinghistory" element={<ParkingHistory />} />
        <Route path="/seathistory" element={<SeatHistory />} />
        <Route path="/user/parking-booking" element={<ParkingBooking />} />
        <Route path="/admin/adminparking" element={<AdminParking />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/user/notifications" element={<UserNotification />} />
        <Route path="/about/us" element={<AboutUsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/AboutUsPage" element={<AboutUsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/admin/team-management" element={<AdminTeamManagement />} />
      </Routes>

      {/* Toast Container for notifications */}
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default App;