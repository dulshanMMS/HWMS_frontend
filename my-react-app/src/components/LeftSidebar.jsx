import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const LeftSidebar = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const isActive = (path) => location.pathname === path;

  // Reload handler for Dashboard
  const handleDashboardClick = () => {
    if (location.pathname === "/user-dashboard") {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Toggle button (mobile only) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[1100] bg-[#052E19] text-white p-2 rounded w-10 h-10 flex items-center justify-center text-xl hover:bg-[#331108]"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#052E19] text-white flex flex-col overflow-y-auto transition-all duration-300 ease-in-out z-[1000] 
          ${
            isOpen ? "w-72 p-6 translate-x-0" : "w-0 p-0 -translate-x-full"
          } lg:w-72 lg:p-6 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-6">
          <span className="text-white text-xl font-semibold tracking-wide uppercase">
            User Panel
          </span>
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Navigation</h3>
          <ul>
            <li className="mb-1">
              <button
                onClick={() => {
                  window.location.href = "http://localhost:5173/user";
                }}
                className="flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] w-full"
              >
                <FaHome /> Dashboard
              </button>

              {/* <SidebarLink
              to="/user"
              icon={<FaHome />}
              label="Dashboard"
              active={isActive("/user")}
              onClick={handleDashboardClick}
            /> */}
            </li>

            <SidebarLink
              to="/seat-booking"
              icon={<FaCalendarAlt />}
              label="Seat Booking"
            />
            <SidebarLink
              to="/notifications"
              icon={<FaBell />}
              label="Notifications"
            />
            <SidebarLink to="/profile" icon={<FaUser />} label="Profile" />
          </ul>
        </div>

        {/* Logout */}
        <div className="mt-auto mb-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex items-center gap-4 w-full py-3 px-4 text-white hover:bg-[#331108] rounded"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>

      {/* Dark overlay on mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[900] lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content wrapper */}
      <div className="flex flex-col lg:ml-72 p-8 bg-gray-100 min-h-screen">
        {children}
      </div>
    </>
  );
};

// Reusable Sidebar Link
const SidebarLink = ({ to, icon, label, active = false, onClick }) => (
  <li className={`mb-1 ${active ? "font-semibold bg-[#331108] relative" : ""}`}>
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] relative"
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#37F568] rounded-r-md"></span>
      )}
      {icon} {label}
    </Link>
  </li>
);

export default LeftSidebar;
