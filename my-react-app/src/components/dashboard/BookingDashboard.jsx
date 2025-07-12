import React, { useEffect, useState } from "react";
import BookingScheduleBlock from "./BookingScheduleBlock";
import axios from "axios";

const BookingDashboard = () => {
  // Active tab state: "seat" or "parking" bookings
  const [activeTab, setActiveTab] = useState("parking");

  // All bookings fetched from backend
  const [allBookings, setAllBookings] = useState([]);

  // Today's seat and parking bookings separately
  const [todaySeatBookings, setTodaySeatBookings] = useState([]);
  const [todayParkingBookings, setTodayParkingBookings] = useState([]);

  // Last 3 closest past seat and parking bookings before today
  const [closestSeatBooking, setClosestSeatBooking] = useState([]);
  const [closestParkingBooking, setClosestParkingBooking] = useState([]);

  // Fetch bookings on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/calendar/user-view", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const bookings = res.data || [];
        setAllBookings(bookings);

        // Format today's date as 'YYYY-MM-DD'
        const todayStr = new Date(new Date().setDate(new Date().getDate()))
          .toISOString()
          .split("T")[0];

        // Filter bookings for today by type
        const seatToday = bookings.filter(
          (b) => b.date === todayStr && b.type === "seat"
        );
        setTodaySeatBookings(seatToday);

        const parkingToday = bookings.filter(
          (b) => b.date === todayStr && b.type === "parking"
        );
        setTodayParkingBookings(parkingToday);

        // Get last 3 closest seat bookings before today, sorted descending by date
        const pastSeatBookings = bookings
          .filter((b) => b.date < todayStr && b.type === "seat")
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setClosestSeatBooking(pastSeatBookings.slice(0, 3));

        // Get last 3 closest parking bookings before today, sorted descending by date
        const pastParkingBookings = bookings
          .filter((b) => b.date < todayStr && b.type === "parking")
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setClosestParkingBooking(pastParkingBookings.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed to load bookings:", err);
      });
  }, []);

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
            onClick={() =>
              setActiveTab(tabName === "Seat Booking" ? "seat" : "parking")
            }
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
          />
          <BookingScheduleBlock
            title="Closest Last Booking"
            bookings={closestSeatBooking}
          />
        </div>
      )}

      {activeTab === "parking" && (
        <div className="flex gap-6 justify-center flex-wrap">
          <BookingScheduleBlock
            title="Today's Schedule"
            bookings={todayParkingBookings}
          />
          <BookingScheduleBlock
            title="Closest Last Booking"
            bookings={closestParkingBooking}
          />
        </div>
      )}
    </div>
  );
};

export default BookingDashboard;
