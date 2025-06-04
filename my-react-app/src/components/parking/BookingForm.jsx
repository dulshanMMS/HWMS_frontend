import React from "react";

const BookingForm = ({ date, entryTime, exitTime, floor, onDateChange, onEntryTimeChange, onExitTimeChange, onFloorChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
    <div className="flex flex-col">
      <label className="mb-2 text-lg font-medium text-gray-700">Enter your date</label>
      <input
        type="date"
        className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
        value={date}
        onChange={onDateChange}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 text-lg font-medium text-gray-700">Entry time</label>
      <input
        type="time"
        className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
        value={entryTime}
        onChange={onEntryTimeChange}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 text-lg font-medium text-gray-700">Exit time</label>
      <input
        type="time"
        className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
        value={exitTime}
        onChange={onExitTimeChange}
      />
    </div>

    <div className="flex flex-col">
      <label className="mb-2 text-lg font-medium text-gray-700">Select floor</label>
      <select
        className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
        value={floor}
        onChange={onFloorChange}
      >
        <option value="1">Floor 1</option>
        <option value="2">Floor 2</option>
      </select>
    </div>
  </div>
);

export default BookingForm;
