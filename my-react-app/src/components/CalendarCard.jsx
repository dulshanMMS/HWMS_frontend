import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingDetailsPanel from "./userCalendar/BookingDetailsPanel";

const CalendarCard = () => {
  // State for currently viewed month/year on calendar
  const [viewDate, setViewDate] = useState(new Date());

  // Public events (e.g., holidays)
  const [events, setEvents] = useState([]);

  // User bookings (seat & parking bookings)
  const [bookings, setBookings] = useState([]);

  // Selected date for details panel
  const [selectedDate, setSelectedDate] = useState(null);

  // Current day number (1-31)
  const currentDay = new Date().getDate();

  // Boolean: are we viewing the current month & year?
  const isCurrentMonth =
    viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  // Number of days in the current viewing month
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  // Load public events/holidays only once when component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/calendar/events")
      .then((res) => setEvents(res.data || []))
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  // Load user bookings whenever the viewed month changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/calendar/user-view", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error("Failed to load bookings:", err));
  }, [viewDate]);

  // Navigate to previous month in calendar
  const goToPreviousMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  // Navigate to next month in calendar
  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Get all matching bookings/events for a specific date
  const getMatchesForDate = (date) => {
    // Format date as yyyy-mm-dd for matching
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    const matches = [];

    // Add bookings matching this date
    bookings.forEach((b) => {
      if (b.date.startsWith(dateStr)) {
        matches.push(b); // push full booking object
      }
    });

    // Add events matching this date with event-specific properties
    events.forEach((e) => {
      if (e.date === dateStr) {
        matches.push({
          type: "event",
          title: e.title,
          time: e.time,
          description: e.description,
        });
      }
    });

    return matches;
  };

  // Get bookings for selected date (for details panel)
  const getBookingsForDate = (dateStr) => {
    return bookings.filter((b) => b.date.startsWith(dateStr));
  };

  // Get events for selected date (for details panel)
  const getEventsForDate = (dateStr) => {
    return events.filter((e) => e.date === dateStr);
  };

  // Determine what type of marks to show on calendar day
  const getDateType = (matches) => {
    const hasSeat = matches.some((m) => m.type === "seat");
    const hasParking = matches.some((m) => m.type === "parking");
    const hasEvent = matches.some((m) => m.type === "event");

    if ((hasSeat || hasParking) && hasEvent) return "both";
    if (hasSeat || hasParking) return "booking";
    if (hasEvent) return "event";
    return null;
  };

  // Handler when user clicks on a day
  const handleDayClick = (date, matches) => {
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    setSelectedDate(dateStr);
  };

  return (
    <div className="flex gap-6">
      {/* Calendar Component */}
      <div className="relative bg-white rounded-xl shadow-md p-4 sm:p-6 w-full min-w-[280px] max-w-[400px]">
        {/* Month navigation header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousMonth}
            className="text-xs sm:text-sm px-1 sm:px-2 py-1 rounded hover:bg-gray-200"
          >
            ◀
          </button>
          <p className="text-sm sm:text-lg font-semibold">
            {viewDate.toLocaleString("default", { month: "long" })}{" "}
            {viewDate.getFullYear()}
          </p>
          <button
            onClick={goToNextMonth}
            className="text-sm px-2 py-1 rounded hover:bg-gray-200"
          >
            ▶
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 text-center font-medium text-xs sm:text-sm mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-xs sm:text-sm">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(
              viewDate.getFullYear(),
              viewDate.getMonth(),
              i + 1
            );
            const isToday = isCurrentMonth && date.getDate() === currentDay;
            const matches = getMatchesForDate(date);
            const type = getDateType(matches);

            // Format date for comparison with selected date
            const dateStr =
              date.getFullYear() +
              "-" +
              String(date.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(date.getDate()).padStart(2, "0");

            const isSelected = selectedDate === dateStr;

            // Base styling for each day cell
            const baseStyle =
              "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors duration-200 text-center";

            // Styling based on day type and selection
            let style = "";
            if (isSelected) {
              style = "bg-blue-500 text-white border-2 border-blue-600";
            } else if (type === "booking") {
              style = "bg-green-200 text-green-900 hover:bg-green-300";
            } else if (type === "event") {
              style = "bg-blue-200 text-blue-900 hover:bg-blue-300";
            } else if (type === "both") {
              style = "bg-purple-300 text-white hover:bg-purple-400";
            } else {
              style = "bg-gray-100 hover:bg-gray-200";
            }

            return (
              <div
                key={i}
                className={`${baseStyle} ${style}`}
                onClick={() => handleDayClick(date, matches)}
              >
                {isToday ? (
                  <span className="font-bold animate-pulse">{i + 1}</span>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-gray-600">Bookings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span className="text-gray-600">Events</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-300 rounded"></div>
            <span className="text-gray-600">Both</span>
          </div>
        </div>
      </div>

      {/* Booking Details Panel */}
      <BookingDetailsPanel
        selectedDate={selectedDate}
        bookings={selectedDate ? getBookingsForDate(selectedDate) : []}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
};

export default CalendarCard;
