// src/components/dashboard/BookingDashboard.jsx
import React, { useEffect, useState } from "react";
import BookingScheduleBlock from "./BookingScheduleBlock";
import axios from "axios";

const BookingDashboard = () => {
  // Active tab state: "seat" or "parking" bookings
  const [activeTab, setActiveTab] = useState("parking");

  // Today's seat and parking bookings separately
  const [todaySeatBookings, setTodaySeatBookings] = useState([]);
  const [todayParkingBookings, setTodayParkingBookings] = useState([]);

  // Last 3 closest past seat and parking bookings before today
  const [closestSeatBooking, setClosestSeatBooking] = useState([]);
  const [closestParkingBooking, setClosestParkingBooking] = useState([]);

  // Loading states for each section
  const [loadingStates, setLoadingStates] = useState({
    todaySeats: false,
    todayParking: false,
    recentSeats: false,
    recentParking: false
  });

  // Pagination parameters - kept small for dashboard performance
  const PAGINATION_LIMITS = {
    today: 5,        // Show max 5 today's bookings
    recent: 3        // Show max 3 recent past bookings
  };

  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Fetch today's bookings with pagination
  const fetchTodayBookings = async (type) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadingKey = type === "seat" ? "todaySeats" : "todayParking";
    setLoading(loadingKey, true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      
      const response = await axios.get("http://localhost:6001/api/calendar/bookings/today", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: type,
          date: todayStr,
          limit: PAGINATION_LIMITS.today,
          page: 1
        }
      });

      const bookings = response.data.bookings || [];
      
      if (type === "seat") {
        setTodaySeatBookings(bookings);
      } else {
        setTodayParkingBookings(bookings);
      }
    } catch (err) {
      console.error(`Failed to load today's ${type} bookings:`, err);
      if (type === "seat") {
        setTodaySeatBookings([]);
      } else {
        setTodayParkingBookings([]);
      }
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Fetch recent past bookings with pagination
  const fetchRecentBookings = async (type) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadingKey = type === "seat" ? "recentSeats" : "recentParking";
    setLoading(loadingKey, true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      
      const response = await axios.get("http://localhost:6001/api/calendar/bookings/recent", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: type,
          beforeDate: todayStr,
          limit: PAGINATION_LIMITS.recent,
          page: 1,
          sortOrder: 'desc' // Most recent first
        }
      });

      const bookings = response.data.bookings || [];
      
      if (type === "seat") {
        setClosestSeatBooking(bookings);
      } else {
        setClosestParkingBooking(bookings);
      }
    } catch (err) {
      console.error(`Failed to load recent ${type} bookings:`, err);
      if (type === "seat") {
        setClosestSeatBooking([]);
      } else {
        setClosestParkingBooking([]);
      }
    } finally {
      setLoading(loadingKey, false);
    }
  };

  // Initial data fetch for both seat and parking
  useEffect(() => {
    // Fetch today's bookings for both types
    fetchTodayBookings("seat");
    fetchTodayBookings("parking");
    
    // Fetch recent bookings for both types
    fetchRecentBookings("seat");
    fetchRecentBookings("parking");
  }, []);

  // Refresh data when tab changes (optional, for better UX)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    // Optional: Refresh data for the selected tab
    const type = newTab === "seat" ? "seat" : "parking";
    
    // Only refresh if we don't have data or it's stale
    if (type === "seat" && todaySeatBookings.length === 0 && !loadingStates.todaySeats) {
      fetchTodayBookings("seat");
      fetchRecentBookings("seat");
    } else if (type === "parking" && todayParkingBookings.length === 0 && !loadingStates.todayParking) {
      fetchTodayBookings("parking");
      fetchRecentBookings("parking");
    }
  };

  return (
    <div>
      {/* Tabs for selecting booking type */}
      <nav className="flex space-x-10 border-b mb-6">
        {["Seat Booking", "Parking Booking"].map((tabName, idx) => (
          <button
            key={idx}
            className={`pb-2 font-medium text-sm ${
              (tabName === "Seat Booking" && activeTab === "seat") ||
              (tabName === "Parking Booking" && activeTab === "parking")
                ? "border-b-2 border-green-700 text-black"
                : "text-gray-500"
            }`}
            onClick={() => handleTabChange(tabName === "Seat Booking" ? "seat" : "parking")}
          >
            {tabName}
          </button>
        ))}
      </nav>

      {/* Booking schedules based on selected tab */}
      {activeTab === "seat" && (
        <div className="flex gap-6 justify-center flex-wrap">
          <BookingScheduleBlock
            title="Today's Schedule"
            bookings={todaySeatBookings}
            loading={loadingStates.todaySeats}
            onRefresh={() => fetchTodayBookings("seat")}
          />
          <BookingScheduleBlock
            title="Closest Last Booking"
            bookings={closestSeatBooking}
            loading={loadingStates.recentSeats}
            onRefresh={() => fetchRecentBookings("seat")}
          />
        </div>
      )}

      {activeTab === "parking" && (
        <div className="flex gap-6 justify-center flex-wrap">
          <BookingScheduleBlock
            title="Today's Schedule"
            bookings={todayParkingBookings}
            loading={loadingStates.todayParking}
            onRefresh={() => fetchTodayBookings("parking")}
          />
          <BookingScheduleBlock
            title="Closest Last Booking"
            bookings={closestParkingBooking}
            loading={loadingStates.recentParking}
            onRefresh={() => fetchRecentBookings("parking")}
          />
        </div>
      )}
    </div>
  );
};

export default BookingDashboard;