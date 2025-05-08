import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import LeftSidebar from "../components/LeftSidebar";
import { getProfile } from "../api/userApi";
import CalendarCard from "../components/CalendarCard";

const UserDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);

  // idebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  // andle screen resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile(token)
        .then((data) => setUserProfile(data))
        .catch((err) => console.error("Failed to load profile", err));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("UserDashboard token:", token);

    if (token) {
      getProfile(token)
        .then((data) => {
          console.log("Fetched user profile:", data);
          setUserProfile(data);
        })
        .catch((err) => {
          console.error(
            "Failed to load profile",
            err.response?.data || err.message
          );
        });
    } else {
      console.warn("No token found in localStorage.");
    }
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-row">
      {/* LEFT SIDEBAR */}
      <LeftSidebar />
      {/*MAIN CONTENT*/}
      <div className="flex flex-col flex-1 p-6 lg:p-10 gap-6">
        {/* ✅ Mobile Toggle Button */}

        {/* Dashboard Heading */}

        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold flex items-center gap-4">
            Dashboard
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-2 focus:outline-none group"
              aria-label="Toggle Sidebar"
            >
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

        {userProfile ? (
          <div className="text-lg font-medium text-gray-600">
            Welcome, {userProfile.firstName} {userProfile.lastName}!
            <div className="text-sm text-gray-500">
              Program: {userProfile.program} | Vehicle No:{" "}
              {userProfile.vehicleNumber}
            </div>
            {userProfile.profilePhoto && (
              <img
                src={userProfile.profilePhoto}
                alt="Profile"
                className="w-16 h-16 rounded-full border mt-2"
              />
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        )}

        {/* Top Summary Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Card: Total Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
            <p className="text-lg font-semibold mb-2">Your Total Bookings</p>
            <p className="text-4xl font-bold">285</p>
          </div>
          <CalendarCard />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-10 border-b">
          {[
            { name: "Bookings", active: true },
            { name: "Seat Bookings" },
            { name: "Parking Bookings" },
          ].map((tab, idx) => (
            <button
              key={idx}
              className={`pb-2 font-medium text-sm ${
                tab.active
                  ? "border-b-2 border-green-700 text-black"
                  : "text-gray-500"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Booking Cards Section */}
        <div className="flex flex-wrap gap-6">
          {/* Example Booking Cards */}
          {["Today’s Schedule", "Yesterday’s Schedule"].map((title, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 w-[260px]"
            >
              <p className="font-semibold mb-2">{title}</p>
              <p className="text-green-700 text-sm font-medium mb-1">
                Desk 5A-9
              </p>
              <p className="text-sm text-gray-500 mb-2">
                4th floor, Conference Room, NetOffice
              </p>
              <p className="text-xs text-gray-600 whitespace-pre-line">
                Feb 07, 2022 9 AM to 6 PM
              </p>
            </div>
          ))}

          {/* View All History Button */}
          <div className="flex items-center">
            <button className="px-4 py-2 bg-white rounded-xl shadow border font-semibold text-sm">
              View All Booking History →
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {/* Always mount the sidebar container to allow transition */}
      <div
        className={`fixed right-0 top-0 h-full w-[320px] bg-white border-l border-gray-200 shadow-md transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} />
      </div>

      {/* Optional: Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
