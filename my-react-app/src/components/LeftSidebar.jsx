import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaExchangeAlt,
  FaCar,
  FaQuestionCircle,
  FaHistory,
  FaBell,
  FaCog,
  FaUser,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaUndo,
} from "react-icons/fa";

const LeftSidebar = ({ children }) => {
  // Get current URL path to determine active link
  const location = useLocation();

  // State to track sidebar open/close on small screens
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar visibility on small screens
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check if a given path matches current URL for active styling
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger menu button visible only on small screens */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[1100] bg-[#052E19] text-white p-2 rounded w-10 h-10 flex items-center justify-center text-xl hover:bg-[#331108]"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>

      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#052E19] text-white flex flex-col overflow-y-auto transition-all duration-300 ease-in-out z-[1000] 
        ${
          isOpen ? "w-72 p-6 translate-x-0" : "w-0 p-0 -translate-x-full"
        } lg:w-72 lg:p-6 lg:translate-x-0`}
      >
        {/* Logo / Brand Name */}
        <div className="mb-6">
          <span className="text-white text-xl font-semibold tracking-wide uppercase">
            WILEYBOOKING
          </span>
        </div>

        {/* Quick Access Section */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Quick Access</h3>
          <ul>
            <SidebarLink to="/user" icon={<FaHome />} label="Dashboard" />
            <SidebarLink
              to="/seat-booking"
              icon={<FaExchangeAlt />}
              label="Seat Booking"
            />
            <SidebarLink
              to="/user/parking-booking"
              icon={<FaCar />}
              label="Parking Booking"
            />

            {/* Seat Booking History with layered icons */}
            <SidebarLink
              to="/seat-booking"
              icon={
                <div className="relative w-4 h-4">
                  {/* Larger faded undo icon */}
                  <FaUndo className="absolute opacity-30 text-3xl -left-2 -top-2" />
                  {/* Smaller exchange icon */}
                  <FaExchangeAlt className="absolute text-1xl" />
                </div>
              }
              label="Seat Booking History"
            />

            {/* Parking Booking History with layered icons */}
            <SidebarLink
              to="/parkinghistory"
              icon={
                <div className="relative w-4 h-4">
                  <FaUndo className="absolute opacity-30 text-3xl -left-2 -top-2" />
                  <FaCar className="absolute text-1xl" />
                </div>
              }
              label="Parking Booking History"
            />

            <SidebarLink
              to="/help"
              icon={<FaQuestionCircle />}
              label="Help Section"
            />
            {/* Commented out Booking History for potential future use */}
            {/* <SidebarLink to="/booking-history" icon={<FaHistory />} label="Booking History" /> */}
          </ul>
        </div>

        {/* Account Section */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Account</h3>
          <ul>
            <SidebarLink
              to="/AdminNotification"
              icon={<FaBell />}
              label="Notifications"
              active={isActive("/AdminNotification")}
            />

            <SidebarLink to="/profile" icon={<FaUser />} label="Profile" />
          </ul>
        </div>

        {/* Logout Button */}
        <div className="mt-auto mb-4">
          <button
            onClick={() => {
              localStorage.removeItem("token"); // Clear auth token
              window.location.href = "/"; // Redirect to homepage/login
            }}
            className="flex items-center gap-4 w-full py-3 px-4 text-white hover:bg-[#331108] rounded"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>

      {/* Overlay behind sidebar on small screens when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[900] lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area with left margin on large screens */}
      {/*<div className="flex flex-col lg:ml-72 p-8 bg-gray-100 min-h-screen">*/}
      <div className="lg:ml-72 bg-gray-100 min-h-screen">  
        {children}
      </div>
    </>
  );
};

// Sidebar navigation link component
const SidebarLink = ({ to, icon, label, active = false }) => (
  <li className={`mb-1 ${active ? "font-semibold bg-[#331108] relative" : ""}`}>
    <Link
      to={to}
      className="flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] relative"
    >
      {/* Left border for active link */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#37F568] rounded-r-md"></span>
      )}
      {icon} {label}
    </Link>
  </li>
);

export default LeftSidebar;
