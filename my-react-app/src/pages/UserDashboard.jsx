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
import useTokenExpiration from "../hooks/useTokenExpiration";
import MessagingButton from '../components/MessagingButton';


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

  // NEW: Separated booking counts
  const [bookingCounts, setBookingCounts] = useState({
    parkingCount: 0,
    seatCount: 0,
    totalCount: 0,
  });
  const [bookingStatsLoading, setBookingStatsLoading] = useState(true);

  // Controls active tab in dashboard (default "Bookings")
  const [activeTab, setActiveTab] = useState("Bookings");

  // NEW: Function to fetch separated booking statistics
  const fetchBookingStats = async (token) => {
    try {
      setBookingStatsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/calendar/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setBookingCounts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch booking statistics:", error);
      // Fallback: calculate from existing data
      try {
        const allBookings = await axios.get(
          "http://localhost:5000/api/calendar/user-view",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const bookings = allBookings.data || [];
        const parkingCount = bookings.filter(
          (b) => b.type === "parking"
        ).length;
        const seatCount = bookings.filter((b) => b.type === "seat").length;

        setBookingCounts({
          parkingCount,
          seatCount,
          totalCount: parkingCount + seatCount,
        });
      } catch (fallbackError) {
        console.error("Fallback booking count also failed:", fallbackError);
      }
    } finally {
      setBookingStatsLoading(false);
    }
  };

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

    // NEW: Fetch separated booking statistics
    fetchBookingStats(token);

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

const clearSensitiveData = () => {
    setUserProfile(null);
    setBookingCounts({ parkingCount: 0, seatCount: 0, totalCount: 0 });
    setTodayBookings([]);
    setClosestLastBookings([]);
    setTodaysBookingCount(0);
    setTotalBookingCount(0);
    setBookingStatsLoading(false);
  };

 useTokenExpiration(clearSensitiveData);

 return (
  <div className="w-full min-h-screen flex bg-green-100">
    <LeftSidebar />
    
    <div className="flex-1 flex">
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6 lg:pr-0 max-w-full overflow-hidden">
        <DashboardHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          userProfile={userProfile} // ← Admin return prop
        />

        {/* User profile summary - responsive width */}
        <div className="mb-6">
          <UserProfileSummary userProfile={userProfile} />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="w-full md:w-80 lg:w-80 xl:w-96">
            <BookingSummaryCard
              bookingCounts={bookingCounts}
              totalBookings={totalBookingCount}
              loading={bookingStatsLoading}
            />
          </div>
          <div className="flex-1 min-w-0">
            <CalendarCard />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <BookingDashboard />
        </div>
      </div>

      {/* Profile sidebar - only show on large screens when open */}
      {sidebarOpen && (
        <div className="hidden lg:block w-80">
          <SidebarWrapper
            sidebarOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>
      )}
    </div>

    {/* Mobile sidebar overlay */}
    <SidebarWrapper
      sidebarOpen={sidebarOpen}
      closeSidebar={() => setSidebarOpen(false)}
    />
      <MessagingButton 
      position="fixed" 
      size="lg"
      className="bottom-6 right-24 z-50" 
    />
    <FloatingChatBot />
  </div>
);
};

export default UserDashboard;
