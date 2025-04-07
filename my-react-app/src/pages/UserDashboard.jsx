import React from "react";
import { FaHome, FaBell, FaUser, FaCog, FaCalendarAlt } from "react-icons/fa";
import useAuthGuard from "../components/AuthGuard";

const UserDashboard = () => {
  useAuthGuard("user");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="logo">USER DASHBOARD</h2>
        <nav>
          <ul>
            <li className="active"><FaHome /> Dashboard</li>
            <li><FaCalendarAlt /> Seat Booking</li>
            <li><FaBell /> Notifications</li>
            <li><FaUser /> Profile</li>
            <li><FaCog /> Settings</li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default UserDashboard;