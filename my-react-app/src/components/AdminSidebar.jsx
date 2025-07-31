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
  FaUsers
} from "react-icons/fa";

const AdminSidebar = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    // Handle exact matches and partial matches for nested routes
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    if (path !== "/admin" && location.pathname.startsWith(path)) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-[1100] bg-[#052E19] text-white p-2 rounded w-10 h-10 flex items-center justify-center text-xl hover:bg-[#331108]"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#052E19] text-white flex flex-col overflow-y-auto transition-all duration-300 ease-in-out z-[1000] 
        ${
          isOpen ? "w-72 p-6 translate-x-0" : "w-0 p-0 -translate-x-full"
        } lg:w-72 lg:p-6 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-6">
          <span className="text-white text-xl font-semibold tracking-wide uppercase">
            WILEYBOOKING
          </span>
        </div>

        {/* Quick Access */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Quick Access</h3>
          <ul>
            <SidebarLink
              to="/admin"
              icon={<FaHome />}
              label="Dashboard"
              active={isActive("/admin")}
            />
            <SidebarLink
              to="/datebooking"
              icon={<FaExchangeAlt />}
              label="Seat Booking"
              active={isActive("/datebooking")}
            />
            <SidebarLink
              to="/user/parking-booking"
              icon={<FaCar />}
              label="Parking Booking"
              active={isActive("/user/parking-booking")}
            />
            <SidebarLink
              to="/help"
              icon={<FaQuestionCircle />}
              label="Help Section"
              active={isActive("/help")}
            />
            {/* <SidebarLink to="/booking-history" icon={<FaHistory />} label="Booking History" active={isActive("/booking-history")} /> */}
          </ul>
        </div>

        {/* Account */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Admin Access</h3>
          <ul>
            <SidebarLink
              to="/AdminNotification"
              icon={<FaBell />}
              label="Notifications"
              active={isActive("/AdminNotification")}
            />
            <SidebarLink 
              to="/admin/adminparking" 
              icon={<FaCar />} 
              label="Parking ADMIN" 
              active={isActive("/admin/adminparking")}
            />
            <SidebarLink 
              to="/admin/team-management" 
              icon={<FaUsers />} 
              label="Teams" 
              active={isActive("/admin/team-management")} 
            />
            <SidebarLink 
              to="/profile" 
              icon={<FaUser />} 
              label="Profile" 
              active={isActive("/profile")}
            />
            <SidebarLink
              to="/admin-reports"
              icon={<FaChartBar />}
              label="View Reports"
              active={isActive("/admin-reports")}
            />
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

      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[900] lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="lg:ml-72 bg-gray-100 min-h-screen">
        {children}
      </div>
    </>
  );
};

// Reusable Link component
const SidebarLink = ({ to, icon, label, active = false }) => (
  <li className={`mb-1 ${active ? "font-semibold bg-[#331108] relative" : ""}`}>
    <Link
      to={to}
      className={`flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] relative transition-all duration-200 ${
        active ? "bg-[#331108] font-semibold" : ""
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#37F568] rounded-r-md"></span>
      )}
      {icon} {label}
    </Link>
  </li>
);

export default AdminSidebar;