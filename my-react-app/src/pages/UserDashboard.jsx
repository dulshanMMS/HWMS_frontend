import { useEffect, useState } from "react";
import CalendarCard from "../components/CalendarCard";
import FloatingChatBot from "../components/FloatingChatBot";
import LeftSidebar from "../components/LeftSidebar";

import BookingSummaryCard from "../components/dashboard/BookingSummaryCard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import UserProfileSummary from "../components/dashboard/UserProfileSummary";

import BookingDashboard from "../components/dashboard/BookingDashboard";
import SidebarWrapper from "../components/profilesidebar/SidebarWrapper";

import axios from "axios";
import { getProfile } from "../api/userApi";

const UserDashboard = () => {
  // State to hold the current user's profile data
  const [userProfile, setUserProfile] = useState(null);

  // Controls sidebar visibility
  // Sidebar is open by default on screens wider than 1024px (desktop)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  // States to hold booking information
  const [todayBookings, setTodayBookings] = useState([]); // Bookings for today
  const [closestLastBookings, setClosestLastBookings] = useState([]); // Latest past bookings

  // Booking counts for display and notifications
  const [todaysBookingCount, setTodaysBookingCount] = useState(0); // Number of bookings today
  const [totalBookingCount, setTotalBookingCount] = useState(0); // Total bookings count

  // Controls active tab in dashboard (default "Bookings")
  const [activeTab, setActiveTab] = useState("Bookings");

  // Effect to update sidebar visibility on window resize
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);

    window.addEventListener("resize", handleResize);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to fetch user profile and booking data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // If no token found, do not fetch data

    // Fetch user profile using token-based authentication
    getProfile(token)
      .then((data) => setUserProfile(data))
      .catch((err) => console.error("Failed to load profile", err));

    // Fetch booking data for the user from backend API
    axios
      .get("http://localhost:5000/api/calendar/user-view", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const allBookings = res.data || [];

        // Set total booking count
        setTotalBookingCount(allBookings.length);

        // Get today's date string in ISO format yyyy-mm-dd
        const todayStr = new Date().toISOString().split("T")[0];

        // Filter bookings whose date starts with today's date string
        const todayFiltered = allBookings.filter((b) =>
          b.date.startsWith(todayStr)
        );
        setTodayBookings(todayFiltered);
        setTodaysBookingCount(todayFiltered.length);

        // Filter bookings that happened before today (past bookings)
        const pastBookings = allBookings.filter((b) => b.date < todayStr);

        if (pastBookings.length > 0) {
          // Find the most recent date among past bookings
          const maxDate = pastBookings.reduce(
            (max, b) => (b.date > max ? b.date : max),
            pastBookings[0].date
          );
          // Get all bookings that happened on the most recent past date
          const closestLast = pastBookings.filter((b) => b.date === maxDate);
          setClosestLastBookings(closestLast);
        } else {
          // If no past bookings, clear the closest last bookings state
          setClosestLastBookings([]);
        }
      })
      .catch((err) => console.error("Failed to load bookings:", err));
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-row">
      {/* Left Sidebar Navigation */}
      <LeftSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 p-6 lg:p-10 gap-6">
        {/* Header with sidebar toggle */}
        <DashboardHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* User profile summary display */}
        <UserProfileSummary userProfile={userProfile} />

        {/* Booking summary and calendar cards */}
        <div className="flex flex-col lg:flex-row gap-6">
          <BookingSummaryCard totalBookings={totalBookingCount} />
          <CalendarCard />
        </div>

        {/* Booking dashboard and action button */}
        <div className="flex flex-wrap gap-6">
          <BookingDashboard />

          <div className="flex items-center">
            <button className="px-4 py-2 bg-white rounded-xl shadow border font-semibold text-sm">
              View All Booking History →
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar overlay for smaller screens */}
      <SidebarWrapper
        sidebarOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Floating chatbot for user assistance */}
      <FloatingChatBot />
    </div>
  );
};

export default UserDashboard;
