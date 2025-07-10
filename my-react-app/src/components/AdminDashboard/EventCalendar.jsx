import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const formatDateToYMD = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split("T")[0];
};

/**
 * Calendar with event highlights and today's event list.
 *
 * Selected date on calendar.
 * Setter for selected date.
 * Dates that have events (YYYY-MM-DD).
 * Events for currently selected day.
 * Callback when a date is clicked.
 */

const EventCalendar = ({ date, setDate, eventDates, todayEvents, onDayClick }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold mb-2">Event Calendar</h2>
      <Calendar
        onClickDay={onDayClick}
        value={date}
        tileClassName={({ date: tileDate }) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today's date
          const thisDate = new Date(tileDate);
          thisDate.setHours(0, 0, 0, 0); // Normalize tile date

          const isToday = thisDate.getTime() === today.getTime();
          const isEventDay = eventDates.includes(formatDateToYMD(thisDate));
          const isPast = thisDate < today;

          if (isToday) return "bg-green-300 text-white rounded-full";

          if (isEventDay && isPast) return "bg-gray-100 text-gray-600 rounded-lg";
          if (isEventDay) return "bg-yellow-200 font-semibold rounded-lg";

          return null;
        }}
      />
      <div className="mt-4">
        <h3 className="font-semibold">Today's Events:</h3>
        {todayEvents.length > 0 ? (
          <ul className="list-disc ml-4 text-sm mt-1">
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