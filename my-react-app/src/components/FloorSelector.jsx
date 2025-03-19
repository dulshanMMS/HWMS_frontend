import React, { useState, useRef, useEffect } from "react";

const FloorSelector = ({ selectedFloor, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const floors = ["Floor 1", "Floor 2"];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (floor) => {
    onChange({ target: { value: floor } });
    setIsOpen(false);
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Choose Floor</h3>
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full p-2 border rounded flex justify-between items-center cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedFloor || "Select Floor"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {isOpen && (
          <div className="absolute mt-1 w-full border rounded bg-white z-10 shadow-md">
            <div className="p-2 hover:bg-gray-200 cursor-pointer">Select Floor</div>
            {floors.map((floor) => (
              <div
                key={floor}
                className="p-2 cursor-pointer hover:bg-green-500 hover:text-white"
                onClick={() => handleSelect(floor)}
              >
                {floor}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Hidden select for form submission if needed */}
      <select
        value={selectedFloor}
        onChange={onChange}
        className="sr-only"
      >
        <option value="">Select Floor</option>
        {floors.map((floor) => (
          <option key={floor} value={floor}>
            {floor}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FloorSelector;