import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import LeftSidebar from "../components/LeftSidebar";
import { getProfile } from "../api/userApi";

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
  // Get current date information
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

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

          {/* Card: Calendar */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
            <p className="text-sm font-medium mb-1 text-right">
              Event Calendar
            </p>
            <p className="text-lg font-semibold text-right mb-4">
              {today.toLocaleString("default", { month: "long" })} {currentYear}
            </p>

            {/* Calendar */}
            <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Calendar: Dates */}
            <div className="grid grid-cols-7 gap-2 text-sm">
              {Array.from({ length: 31 }, (_, i) => {
                const date = new Date(currentYear, currentMonth, i + 1);
                const isToday =
                  date.getDate() === currentDay &&
                  date.getMonth() === currentMonth &&
                  date.getFullYear() === currentYear;

                return (
                  <div
                    key={i}
                    className={`h-10 flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors duration-200 ${
                      isToday
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
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
      {sidebarOpen && (
        <div className="w-[320px] min-h-screen bg-white border-l border-gray-200 shadow-md">
          <Sidebar isOpen={sidebarOpen} />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
