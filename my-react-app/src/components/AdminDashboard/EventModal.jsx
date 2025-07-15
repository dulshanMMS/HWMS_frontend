
// Modal component for viewing, adding and deleting events
const EventModal = ({ date, events, newEvent, setNewEvent, onClose, onAdd, onDelete }) => {
  const today = new Date();
  const selectedDate = new Date(date);
  // Compare only dates (ignore time)
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const isPastDate = selectedDate < today;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Events on {date.toDateString()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Show existing events */}
        {events.length > 0 ? (
          <ul className="text-sm list-disc ml-4 mb-4 max-h-40 overflow-y-auto">
            {events.map((ev, idx) => (
              <li key={idx} className="flex justify-between items-start">
                <div>
                  <strong>{ev.title}</strong>{" "}
                  {ev.time && `at ${ev.time}`}
                  {ev.description && ` - ${ev.description}`}
                </div>
                <button
                  onClick={() => onDelete(ev._id)}
                  className="text-red-600 hover:underline ml-2 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No events yet. Add one below!</p>
        )}

        <hr className="my-2" />
        <h3 className="font-semibold mb-1">Add New Event</h3>

        {isPastDate ? (
          <p className="text-sm text-red-500 italic">
            You can't add events for past dates.
          </p>
        ) : (
          <>
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border rounded resize-none"
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            ></textarea>
          </>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onAdd}
            disabled={isPastDate}
            className={`px-4 py-2 rounded text-white ${
              isPastDate
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
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
