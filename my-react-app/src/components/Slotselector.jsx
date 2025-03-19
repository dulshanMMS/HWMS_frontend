import React from "react";

const SlotSelector = ({ selectedFloor, selectedSlot, onSelectSlot }) => {
  const slots = ["Slot 1", "Slot 2", "Slot 3", "Slot 4"];

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Available Slots on {selectedFloor}</h3>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelectSlot(slot)}
            className={`px-4 py-2 border rounded ${
              selectedSlot === slot
                ? "bg-green-500 text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlotSelector;