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

  const formatDateToYMD = (d) => {
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const getDateClass = (tileDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisDate = new Date(tileDate);
    thisDate.setHours(0, 0, 0, 0);

    const formatted = formatDateToYMD(thisDate);
    const normalizedEventDates = eventDates.map((d) => d?.split("T")[0]?.trim());

    const isToday = thisDate.getTime() === today.getTime();
    const isEventDay = normalizedEventDates.includes(formatted);
    const isPast = thisDate < today;

    if (isToday) return "bg-green-500 text-white font-bold animate-pulse ring ring-green-300";
    if (isEventDay && isPast) return "bg-gray-300 text-gray-700 font-semibold";
    if (isEventDay) return "bg-yellow-200 text-yellow-900 font-semibold shadow-inner";
    return "bg-gray-100 hover:bg-blue-200 transition";
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full animate-fade-in">
      {/* Header */}
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

        <p className="text-lg font-bold text-gray-800">
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

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm font-medium mb-2 text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
          return (
            <div
              key={i}
              className={`h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer transition-all ${getDateClass(currentDate)}`}
              onClick={() => onDayClick(currentDate)}
              title={currentDate.toDateString()}
            >
              <span>{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Today's Events */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-inner">
        <h3 className="font-semibold text-gray-700 mb-2">📅 Today's Events</h3>
        {todayEvents.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
            {todayEvents.map((event, idx) => (
              <li key={idx}>{event.title}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No events for today.</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
