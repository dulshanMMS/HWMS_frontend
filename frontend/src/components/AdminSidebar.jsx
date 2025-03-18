import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaCar, FaQuestionCircle, FaHistory, 
         FaBell, FaCog, FaUser, FaChartBar, FaSignOutAlt, FaBars } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ children }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <button className="menu-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>
            
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo Section */}
                <div className="logo-section">
                    <span className="booking-text">WILEYBOOKING</span>
                </div>

                {/* Quick Access Section */}
                <div className="sidebar-section">
                    <h3>Quick Access</h3>
                    <ul>
                        <li className={isActive('/admin') ? 'active' : ''}>
                            <Link to="/admin">
                                <FaHome /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/seat-booking">
                                <FaExchangeAlt /> Seat Booking
                            </Link>
                        </li>
                        <li>
                            <Link to="/parking-booking">
                                <FaCar /> Parking Booking
                            </Link>
                        </li>
                        <li>
                            <Link to="/help">
                                <FaQuestionCircle /> Help Section
                            </Link>
                        </li>
                        <li>
                            <Link to="/booking-history">
                                <FaHistory /> Booking History
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Account Section */}
                <div className="sidebar-section">
                    <h3>Account</h3>
                    <ul>
                        <li className={isActive('/AdminNotification') ? 'active' : ''}>
                            <Link to="/AdminNotification">
                                <FaBell /> Notifications
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <FaCog /> Settings
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile">
                                <FaUser /> Profile
                            </Link>
                        </li>
                        <li className={isActive('/admin-reports') ? 'active' : ''}>
                            <Link to="/admin-reports">
                                <FaChartBar /> View Reports
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Logout Section */}
                <div className="logout-section">
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }}>
                        <FaSignOutAlt /> Log Out
                    </button>
                </div>
            </div>
            
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
        </>
    );
};

export default AdminSidebar; 