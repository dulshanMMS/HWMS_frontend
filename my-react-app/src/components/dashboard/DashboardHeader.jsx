import React from "react";
import { FaChartLine, FaBell, FaSearch, FaCog } from "react-icons/fa";

/**
 * DashboardHeader component displays the main page title ("Dashboard")
 * and a hamburger toggle button for the sidebar on smaller screens
 * with modern styling and additional features.
 *
 * Props:
 * - sidebarOpen (boolean): current open/close state of sidebar.
 * - toggleSidebar (function): callback to toggle sidebar visibility.
 */
const DashboardHeader = ({ sidebarOpen, toggleSidebar }) => {
  // Get current date and time for display
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between border border-gray-100 p-6 mb-6">
      {/* Left Section - Title and Date */}
      <div className="flex items-center gap-6">
        {/* Dashboard Title with Icon */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-900 rounded-xl shadow-lg">
            <FaChartLine className="text-white text-xl" />
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 font-medium hidden sm:block">
              {currentDate}
            </p>
          </div>
        </div>

        {/* Sidebar toggle button - only visible on small screens */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden relative p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 group"
          aria-label="Toggle Sidebar"
        >
          {/* Hamburger icon with smooth animation */}
          <div className="space-y-1.5 w-6 h-6 flex flex-col justify-center">
            <span
              className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ease-in-out ${
                sidebarOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out ${
                sidebarOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ease-in-out ${
                sidebarOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>

          {/* Ripple effect on click */}
          <div className="absolute inset-0 rounded-xl bg-blue-200 opacity-0 group-active:opacity-30 transition-opacity duration-150"></div>
        </button>
      </div>

      {/* Right Section - Actions and Time */}
      <div className="flex items-center gap-4">
        {/* Current Time Display */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">
            {currentTime}
          </span>
        </div>

        {/* Quick Stats Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-xl border border-green-100">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-700">
              System Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
