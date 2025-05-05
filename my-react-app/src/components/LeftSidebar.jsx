import React from "react";
import { FaHome, FaBell, FaUser, FaCog, FaCalendarAlt } from "react-icons/fa";

const LeftSidebar = () => {
  return (
    <div className="w-[220px] min-h-screen bg-green-700 border-r border-gray-200 shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">USER DASHBOARD</h2>
      <nav>
        <ul className="space-y-4 text-gray-700 font-medium text-sm">
          <li className="flex items-center gap-2 cursor-pointer hover:text-green-700">
            <FaHome /> Dashboard
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-green-700">
            <FaCalendarAlt /> Seat Booking
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-green-700">
            <FaBell /> Notifications
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-green-700">
            <FaUser /> Profile
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-green-700">
            <FaCog /> Settings
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSidebar;
