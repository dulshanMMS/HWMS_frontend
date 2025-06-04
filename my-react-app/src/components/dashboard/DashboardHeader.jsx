import React from "react";

/**
 * DashboardHeader component displays the main page title ("Dashboard")
 * and a hamburger toggle button for the sidebar on smaller screens.
 *
 * Props:
 * - sidebarOpen (boolean): current open/close state of sidebar.
 * - toggleSidebar (function): callback to toggle sidebar visibility.
 */
const DashboardHeader = ({ sidebarOpen, toggleSidebar }) => (
  <div className="flex items-center justify-between">
    <h1 className="text-4xl font-bold flex items-center gap-4">
      Dashboard
      {/* Sidebar toggle button - only visible on small screens (hidden on lg and above) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 focus:outline-none group"
        aria-label="Toggle Sidebar"
      >
        {/* Hamburger icon made with three lines that animate into X when open */}
        <div className="space-y-1.5">
          <span
            className={`block h-0.5 w-6 bg-gray-800 transform transition duration-300 ${
              sidebarOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-gray-800 transition duration-300 ${
              sidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-gray-800 transform transition duration-300 ${
              sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </div>
      </button>
    </h1>
  </div>
);

export default DashboardHeader;
