import React from "react";

const AvailableSlots = ({ slots, selectedSlot, onSelect }) => {
  if (slots.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2 text-green-600">Available Slots:</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {slots.map(slot => (
          <button
            key={slot.slotNumber}
            className={`p-2 border rounded-md ${
              selectedSlot === slot.slotNumber ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-green-100"
            }`}
            onClick={() => onSelect(slot.slotNumber)}
          >
            Slot {slot.slotNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvailableSlots;
