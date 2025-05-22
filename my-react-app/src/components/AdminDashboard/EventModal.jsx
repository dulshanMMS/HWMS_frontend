import React from "react";

/**
 * Modal component for viewing, adding and deleting events.
 *
 * Selected date for events.
 * Events on the selected date.
 * Current new event being created.
 * Setter for newEvent.
 * Handler to close the modal.
 * Handler to add new event.
 * Handler to delete an event.
 */
//the pop up model
const EventModal = ({ date, events, newEvent, setNewEvent, onClose, onAdd, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
      <h2 className="text-lg font-bold mb-2">Events on {date.toDateString()}</h2>

      {events.length > 0 ? (
        <ul className="text-sm list-disc ml-4 mb-4">
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
      <div className="flex justify-between mt-4">
        <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
        <button onClick={onAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Event
        </button>
      </div>
    </div>
  </div>
);

export default EventModal;
