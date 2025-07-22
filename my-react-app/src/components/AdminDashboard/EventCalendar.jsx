import React from "react";

const EventCalendar = ({ date, setDate, eventDates, todayEvents, onDayClick }) => {
  const viewDate = new Date(date);
  const currentDay = new Date().getDate();

  const isCurrentMonth =
    viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  const goToPreviousMonth = () => {
    setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const formatDateToYMD = (d) => {
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const getDateClass = (tileDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisDate = new Date(tileDate);
    thisDate.setHours(0, 0, 0, 0);

    const formatted = formatDateToYMD(thisDate); // e.g., "2025-07-30"

    const normalizedEventDates = eventDates.map(dateStr => {
      if (!dateStr) return "";
      return dateStr.split("T")[0].trim();
    });

    const isToday = thisDate.getTime() === today.getTime();
    const isEventDay = normalizedEventDates.includes(formatted);
    const isPast = thisDate < today;

    if (isToday) return "bg-green-400 text-white font-bold animate-pulse";
    if (isEventDay && isPast) return "bg-gray-300 text-gray-700 font-medium";
    if (isEventDay) return "bg-yellow-200 text-yellow-900 font-semibold";
    return "bg-gray-100 hover:bg-gray-200";
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-6 w-full">
      {/* Month, Year navigation header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
            className="text-sm px-2 py-1 rounded hover:bg-gray-200"
          >
            ⏮
          </button>
          <button
            onClick={() => setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="text-sm px-2 py-1 rounded hover:bg-gray-200"
          >
            ◀
          </button>
        </div>

        <p className="text-lg font-semibold">
          {viewDate.toLocaleString("default", { month: "long" })} {viewDate.getFullYear()}
        </p>

        <div className="flex space-x-2">
          <button
            onClick={() => setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="text-sm px-2 py-1 rounded hover:bg-gray-200"
          >
            ▶
          </button>
          <button
            onClick={() => setDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
            className="text-sm px-2 py-1 rounded hover:bg-gray-200"
          >
            ⏭
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
          const isToday = isCurrentMonth && currentDate.getDate() === currentDay;

          return (
            <div
              key={i}
              className={`h-12 w-12 flex items-center justify-center rounded-lg cursor-pointer ${getDateClass(currentDate)}`}
              onClick={() => onDayClick(currentDate)}
            >
              <span>{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Today's events section */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-1">Today's Events:</h3>
        {todayEvents.length > 0 ? (
          <ul className="list-disc ml-5 text-sm text-gray-800">
            {todayEvents.map((event, idx) => (
              <li key={idx}>{event.title}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No special events today.</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
