import React, { useEffect, useState } from "react";
import axios from "axios";

const CalendarCard = () => {
  // State for currently viewed month/year on calendar
  const [viewDate, setViewDate] = useState(new Date());

  // Public events (e.g., holidays)
  const [events, setEvents] = useState([]);

  // User bookings (seat & parking bookings)
  const [bookings, setBookings] = useState([]);

  // Selected date's info for popup display
  const [selectedInfo, setSelectedInfo] = useState(null);

  // Position for popup (x, y coordinates)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

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
      .get("http://localhost:5004/api/calendar/events")
      .then((res) => setEvents(res.data || []))
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  // Load user bookings whenever the viewed month changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5004/api/calendar/user-view", {
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

  // Handler when user clicks on a day with matching info
  const handleDayClick = (matches, e) => {
    if (matches.length > 0) {
      setSelectedInfo(matches);
      setPopupPosition({ x: e.clientX, y: e.clientY });

      // Auto-hide popup after 5 seconds
      setTimeout(() => setSelectedInfo(null), 5000);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6 w-full lg:w-[360px]">
      {/* Month navigation header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-sm px-2 py-1 rounded hover:bg-gray-200"
        >
          ◀
        </button>
        <p className="text-lg font-semibold">
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
      <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            i + 1
          );
          const isToday = isCurrentMonth && date.getDate() === currentDay;
          const matches = getMatchesForDate(date);
          const type = getDateType(matches);

          // Base styling for each day cell
          const baseStyle =
            "h-12 w-12 flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors duration-200 text-center";

          // Styling based on day type
          const style =
            type === "booking"
              ? "bg-green-200 text-green-900"
              : type === "event"
              ? "bg-blue-200 text-blue-900"
              : type === "both"
              ? "bg-purple-300 text-white"
              : "bg-gray-100 hover:bg-gray-200";

          return (
            <div
              key={i}
              className={`${baseStyle} ${style}`}
              onClick={(e) => handleDayClick(matches, e)}
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

      {/* Popup displaying details of selected date */}
      {selectedInfo && (
        <div
          className="fixed bg-white border shadow-md rounded-md p-4 text-sm z-50 w-[260px]"
          style={{
            top: `${popupPosition.y + 10}px`,
            left: `${popupPosition.x + 10}px`,
          }}
        >
          <h4 className="font-semibold text-gray-800 mb-2">Day Details</h4>
          <ul className="space-y-2">
            {selectedInfo.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                {item.type === "event" ? (
                  <>
                    <strong>Event:</strong> {item.title}
                    <br />
                    <span className="text-xs">{item.time}</span>
                    <br />
                    <span className="text-xs text-gray-600">
                      {item.description}
                    </span>
                  </>
                ) : (
                  <>
                    <strong>
                      {item.type === "seat"
                        ? "Seat Booking"
                        : "Parking Booking"}
                      :
                    </strong>{" "}
                    {item.details}
                    {item.floor && (
                      <>
                        <br />
                        <span className="text-xs text-gray-600">
                          Floor: {item.floor}
                        </span>
                      </>
                    )}
                    {item.entryTime && item.exitTime && (
                      <>
                        <br />
                        <span className="text-xs text-gray-600">
                          {item.entryTime} - {item.exitTime}
                        </span>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CalendarCard;
