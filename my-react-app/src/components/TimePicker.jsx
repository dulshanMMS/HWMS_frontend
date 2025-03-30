import React, { useState, useRef, useEffect } from "react";

const TimePicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (time) => {
    onChange({ target: { value: time } });
    setIsOpen(false);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <div className="relative" ref={dropdownRef}>
        {isOpen && (
          <div className="absolute bottom-full mb-1 w-full border rounded bg-white z-10 max-h-60 overflow-auto">
            <div className="p-2 hover:bg-gray-200 cursor-pointer">Select Time</div>
            {timeSlots.map((time) => (
              <div
                key={time}
                className="p-2 cursor-pointer hover:bg-green-500 hover:text-white"
                onClick={() => handleSelect(time)}
              >
                {time}
              </div>
            ))}
          </div>
        )}
        <div
          className="w-full p-2 border rounded flex justify-between items-center cursor-pointer bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value || "Select Time"}
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
      </div>
      {/* Hidden select for form submission if needed */}
      <select
        value={value}
        onChange={onChange}
        className="sr-only"
      >
        <option value="">Select Time</option>
        {timeSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;