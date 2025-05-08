import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import LeftSidebar from "../components/LeftSidebar";
import { getProfile } from "../api/userApi";
import CalendarCard from "../components/CalendarCard";
import FloatingChatBot from "../components/FloatingChatBot";

const UserDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);

  // idebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const [todayBookings, setTodayBookings] = useState([]);
  const [yesterdayBookings, setYesterdayBookings] = useState([]);

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

  //   useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   axios
  //     .get("http://localhost:5000/api/calendar/user-view", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((res) => {
  //       const all = res.data || [];
  //       const todayStr = new Date().toISOString().split("T")[0];

  //       const yesterday = new Date();
  //       yesterday.setDate(yesterday.getDate() - 1);
  //       const yesterdayStr = yesterday.toISOString().split("T")[0];

  //       setTodayBookings(all.filter((b) => b.date === todayStr));
  //       setYesterdayBookings(all.filter((b) => b.date === yesterdayStr));
  //     })
  //     .catch((err) => console.error("Failed to load schedule bookings:", err));
  // }, []);

  const [totalBookingCount, setTotalBookingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      //  Load user profile
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

      //  Load total booking count for this user
      axios
        .get("http://localhost:5000/api/calendar/user-view", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const all = res.data || [];
          setTotalBookingCount(all.length);
        })
        .catch((err) => console.error("Failed to load total bookings:", err));
    } catch (e) {
      console.error("Unexpected error in dashboard useEffect:", e);
    }
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-row">
      {/* LEFT SIDEBAR */}
      <LeftSidebar />
      {/*MAIN CONTENT*/}
      <div className="flex flex-col flex-1 p-6 lg:p-10 gap-6">
        {/* Mobile Toggle Button */}

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
            <p className="text-4xl font-bold">{totalBookingCount}</p>
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
          {[
            { title: "Today’s Schedule", data: todayBookings },
            { title: "Yesterday’s Schedule", data: yesterdayBookings },
          ].map((block, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 w-[260px]"
            >
              <p className="font-semibold mb-2">{block.title}</p>
              {block.data.length === 0 ? (
                <p className="text-sm text-gray-500">No bookings</p>
              ) : (
                block.data.map((booking, i) => (
                  <div key={i} className="mb-3 text-sm text-gray-700">
                    <p className="font-medium text-green-700">
                      {booking.type === "seat" ? "Seat" : "Parking"}:{" "}
                      {booking.details}
                    </p>
                    {booking.floor && (
                      <p className="text-xs text-gray-500">
                        Floor: {booking.floor}
                      </p>
                    )}
                    {booking.entryTime && booking.exitTime && (
                      <p className="text-xs text-gray-500">
                        {booking.entryTime} - {booking.exitTime}
                      </p>
                    )}
                  </div>
                ))
              )}
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
      <FloatingChatBot />
    </div>
  );
};

export default UserDashboard;
