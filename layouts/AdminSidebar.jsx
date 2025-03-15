import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBell, FaChartBar, FaCalendar, FaCog } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>HWMS Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/adminNotification"
            className={`nav-item ${isActive('/adminNotification') ? 'active' : ''}`}
          >
            <FaBell className="nav-icon" />
            <span>Notifications</span>
          </Link>
          <Link
            to="/adminReports"
            className={`nav-item ${isActive('/adminReports') ? 'active' : ''}`}
          >
            <FaChartBar className="nav-icon" />
            <span>Reports</span>
          </Link>
          <Link
            to="/adminCalendar"
            className={`nav-item ${isActive('/adminCalendar') ? 'active' : ''}`}
          >
            <FaCalendar className="nav-icon" />
            <span>Calendar</span>
          </Link>
          <Link
            to="/adminSettings"
            className={`nav-item ${isActive('/adminSettings') ? 'active' : ''}`}
          >
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminSidebar; 