import React, { useEffect, useState } from "react";
import axios from "axios";

const CalendarCard = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]); // 🟦 Public events
  const [bookings, setBookings] = useState([]); // 🟩 🟧 Seat & Parking bookings
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const currentDay = new Date().getDate();
  const isCurrentMonth =
    viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  // 🟦 Load public holidays/events once
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/calendar/events")
      .then((res) => setEvents(res.data || []))
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  // 🟩🟧 Load all bookings for the visible month
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/calendar/user-view", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBookings(res.data || []);
      })
      .catch((err) => console.error("Failed to load bookings:", err));
  }, [viewDate]);

  const goToPreviousMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getMatchesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const matches = [];

    bookings.forEach((b) => {
      if (b.date.startsWith(dateStr)) {
        matches.push({
          type: b.type,
          details: b.details,
        });
      }
    });

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

  const getDateType = (matches) => {
    const hasSeat = matches.some((m) => m.type === "seat");
    const hasParking = matches.some((m) => m.type === "parking");
    const hasEvent = matches.some((m) => m.type === "event");

    if ((hasSeat || hasParking) && hasEvent) return "both";
    if (hasSeat || hasParking) return "booking";
    if (hasEvent) return "event";
    return null;
  };

  const handleDayClick = (matches, e) => {
    if (matches.length > 0) {
      setSelectedInfo(matches);
      setPopupPosition({ x: e.clientX, y: e.clientY });
      setTimeout(() => setSelectedInfo(null), 5000);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6 w-full lg:w-[360px]">
      {/* 📅 Month Navigation */}
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

      {/* 📆 Weekday Labels */}
      <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* 📅 Days */}
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

          const baseStyle =
            "h-12 w-12 flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors duration-200 text-center";
          const style =
            type === "booking"
              ? "bg-green-200 text-green-900"
              : type === "event"
              ? "bg-blue-200 text-blue-900"
              : type === "both"
              ? "bg-purple-300 text-white"
              : isToday
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200";

          return (
            <div
              key={i}
              className={`${baseStyle} ${style}`}
              onClick={(e) => handleDayClick(matches, e)}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {/* 📌 Popup for clicked date */}
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
