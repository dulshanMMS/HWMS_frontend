import Calendar from 'react-calendar';

const EventCalendar = ({ date, setDate, eventDates, handleDayClick, showEventModal, setShowEventModal, events }) => {
  const formatDateToYMD = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="font-semibold mb-2">Event Calendar</h2>
      <Calendar
        onClickDay={handleDayClick}
        value={date}
        tileClassName={({ date: tileDate }) => {
          const today = new Date();
          const isToday =
            tileDate.getDate() === today.getDate() &&
            tileDate.getMonth() === today.getMonth() &&
            tileDate.getFullYear() === today.getFullYear();
          const isEventDay = eventDates.includes(formatDateToYMD(tileDate));
          if (isToday) return 'bg-green-300 text-white rounded-full';
          if (isEventDay) return 'bg-yellow-200 font-semibold rounded-lg';
          return null;
        }}
      />
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h2 className="text-lg font-bold mb-2">Events on {date.toDateString()}</h2>
            {events.length > 0 ? (
              <ul className="text-sm list-disc ml-4 mb-4">
                {events.map((ev, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div>
                      <strong>{ev.title}</strong> {ev.time && `at ${ev.time}`}
                      {ev.description && ` - ${ev.description}`}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No events yet.</p>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowEventModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
