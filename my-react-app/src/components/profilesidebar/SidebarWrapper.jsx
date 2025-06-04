import React from "react";
import ProfileSidebar from "../ProfileSidebar";

/**
 * SidebarWrapper manages the sidebar panel and overlay for mobile view.
 *
 * Props:
 * - sidebarOpen (bool): Whether the sidebar is currently open.
 * - closeSidebar (func): Function to close the sidebar (triggered by overlay click).
 */
const SidebarWrapper = ({ sidebarOpen, closeSidebar }) => (
  <>
    {/* Sidebar panel sliding in/out from right */}
    <div
      className={`fixed right-0 top-0 h-full w-[320px] bg-white border-l border-gray-200 shadow-md transform transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Pass sidebarOpen state to ProfileSidebar */}
      <ProfileSidebar isOpen={sidebarOpen} />
    </div>

    {/* Semi-transparent overlay behind sidebar on mobile screens */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
        onClick={closeSidebar} // Close sidebar on overlay click
      />
    )}
  </>
);

export default SidebarWrapper;
