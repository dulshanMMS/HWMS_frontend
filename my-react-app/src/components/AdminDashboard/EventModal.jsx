const EventModal = ({ date, events, newEvent, setNewEvent, onClose, onAdd, onDelete }) => {
  const today = new Date();
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 space-y-4 border border-gray-200 transition-all duration-300">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-800">📅 Events on {date.toDateString()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl font-bold transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {events.length > 0 ? (
          <ul className="text-sm list-disc ml-5 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-gray-700">
            {events.map((ev, idx) => (
              <li key={idx} className="mb-2 flex justify-between items-start">
                <div className="flex-1">
                  <strong>{ev.title}</strong>
                  {ev.time && ` at ${ev.time}`}
                  {ev.description && ` - ${ev.description}`}
                </div>
                <button
                  onClick={() => onDelete(ev._id)}
                  className="text-red-600 hover:underline text-xs ml-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-2">No events yet. Add one below!</p>
        )}

        <hr className="my-2" />

        <h3 className="font-semibold text-gray-800">➕ Add New Event</h3>

        {isPastDate ? (
          <p className="text-sm text-red-500 italic">You can't add events for past dates.</p>
        ) : (
          <>
            <input
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition mb-2"
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition resize-none"
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </>
        )}

        <div className="text-right pt-2">
          <button
            onClick={onAdd}
            disabled={isPastDate}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
              isPastDate
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
