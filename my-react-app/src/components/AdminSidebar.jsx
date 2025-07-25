// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   FaHome,
//   FaExchangeAlt,
//   FaCar,
//   FaQuestionCircle,
//   FaHistory,
//   FaBell,
//   FaCog,
//   FaUser,
//   FaChartBar,
//   FaSignOutAlt,
//   FaBars,
//   FaUsers
// } from "react-icons/fa";

// const AdminSidebar = ({ children }) => {
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   const isActive = (path) => location.pathname === path;

//   return (
//     <>
//       <button
//         className="lg:hidden fixed top-4 left-4 z-[1100] bg-[#052E19] text-white p-2 rounded w-10 h-10 flex items-center justify-center text-xl hover:bg-[#331108]"
//         onClick={toggleSidebar}
//       >
//         <FaBars />
//       </button>

//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 left-0 h-full bg-[#052E19] text-white flex flex-col overflow-y-auto transition-all duration-300 ease-in-out z-[1000] 
//         ${
//           isOpen ? "w-72 p-6 translate-x-0" : "w-0 p-0 -translate-x-full"
//         } lg:w-72 lg:p-6 lg:translate-x-0`}
//       >
//         {/* Logo */}
//         <div className="mb-6">
//           <span className="text-white text-xl font-semibold tracking-wide uppercase">
//             WILEYBOOKING
//           </span>
//         </div>

//         {/* Quick Access */}
//         <div className="mb-6">
//           <h3 className="text-gray-400 text-sm uppercase mb-3">Quick Access</h3>
//           <ul>
//             <SidebarLink
//               to="/admin"
//               icon={<FaHome />}
//               label="Dashboard"
//               active={isActive("/admin")}
//             />
//             <SidebarLink
//               to="/seat-booking"
//               icon={<FaExchangeAlt />}
//               label="Seat Booking"
//             />
//             <SidebarLink
//               to="/user/parking-booking"
//               icon={<FaCar />}
//               label="Parking Booking"
//             />
//             <SidebarLink
//               to="/help"
//               icon={<FaQuestionCircle />}
//               label="Help Section"
//             />
//             {/* <SidebarLink to="/booking-history" icon={<FaHistory />} label="Booking History" /> */}
//           </ul>
//         </div>

//         {/* Account */}
//         <div className="mb-6">
//           <h3 className="text-gray-400 text-sm uppercase mb-3">Admin Access</h3>
//           <ul>
//             <SidebarLink
//               to="/AdminNotification"
//               icon={<FaBell />}
//               label="Notifications"
//               active={isActive("/AdminNotification")}
//             />
//             <SidebarLink to="/admin/adminparking" icon={<FaCar />} label="Parking ADMIN" />
//             <SidebarLink to="/admin/team-management" icon={<FaUsers />} label="Teams" active={isActive("/admin/team-management")} />
//             <SidebarLink to="/profile" icon={<FaUser />} label="Profile" />
//             <SidebarLink
//               to="/admin-reports"
//               icon={<FaChartBar />}
//               label="View Reports"
//               active={isActive("/admin-reports")}
//             />
//           </ul>
//         </div>

//         {/* Logout */}
//         <div className="mt-auto mb-4">
//           <button
//             onClick={() => {
//               localStorage.removeItem("token");
//               window.location.href = "/";
//             }}
//             className="flex items-center gap-4 w-full py-3 px-4 text-white hover:bg-[#331108] rounded"
//           >
//             <FaSignOutAlt /> Log Out
//           </button>
//         </div>
//       </div>

//       {/* Overlay for small screens */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-[900] lg:hidden"
//           onClick={toggleSidebar}
//         ></div>
//       )}

//       {/* Main Content Area */}
//       {/*<div className="flex flex-col lg:ml-72 p-8 bg-gray-100 min-h-screen">*/}  
//       <div className="lg:ml-72 bg-gray-100 min-h-screen">
//         {children}
//       </div>
//     </>
//   );
// };

// // Reusable Link component
// const SidebarLink = ({ to, icon, label, active = false }) => (
//   <li className={`mb-1 ${active ? "font-semibold bg-[#331108] relative" : ""}`}>
//     <Link
//       to={to}
//       className="flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] relative"
//     >
//       {active && (
//         <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#37F568] rounded-r-md"></span>
//       )}
//       {icon} {label}
//     </Link>
//   </li>
// );

// export default AdminSidebar;





//Added Notification badge Sjay
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from 'axios';
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
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  // Fetch unread notification count for admin
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for AdminSidebar Notification API request');
        return;
      }
      const endpoint = '/api/notifications/admin/unread-count';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('AdminSidebar Notification API response:', response.data);
      const count = response.data.count || 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread notifications in AdminSidebar:', err.message, err.response?.data);
    }
  };

  // Fetch unread count on mount and every minute
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 6000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

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
        ${isOpen ? "w-72 p-6 translate-x-0" : "w-0 p-0 -translate-x-full"} lg:w-72 lg:p-6 lg:translate-x-0`}
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
              active={isActive("/seat-booking")}
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
          </ul>
        </div>

        {/* Admin Access */}
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm uppercase mb-3">Admin Access</h3>
          <ul>
            <SidebarLink
              to="/AdminNotification"
              icon={<FaBell />}
              label="Notifications"
              active={isActive("/AdminNotification")}
              unreadCount={unreadCount}
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
const SidebarLink = ({ to, icon, label, active = false, unreadCount = 0 }) => (
  <li className={`mb-1 ${active ? "font-semibold bg-[#331108] relative" : ""}`}>
    <Link
      to={to}
      className="flex items-center gap-4 py-3 px-4 text-white rounded hover:bg-[#331108] relative"
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#37F568] rounded-r-md"></span>
      )}
      {icon}
      <div className="flex items-center gap-2">
        {label}
        {unreadCount > 0 && label === "Notifications" && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Link>
  </li>
);

export default AdminSidebar;
