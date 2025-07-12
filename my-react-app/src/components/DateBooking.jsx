import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Popup from "./Popup";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import { jwtDecode } from "jwt-decode";

export default function DateBooking() {
  const navigate = useNavigate();

  // Prevent scrolling when component mounts
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalDocumentOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalDocumentOverflow;
    };
  }, []);

  // States used for date/time/floor selection and popup messages
  const [date, setDate] = useState(new Date());
  const [entryHour, setEntryHour] = useState(9);
  const [entryMinute, setEntryMinute] = useState(0);
  const [exitHour, setExitHour] = useState(10);
  const [exitMinute, setExitMinute] = useState(0);
  const [floor, setFloor] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [user, setUser] = useState('');

  // Decode JWT to get the logged-in user's username
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.username);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  // Helper to pad numbers <10 with a leading zero for display
  const pad = (num) => (num < 10 ? "0" + num : num);

  // Validate inputs and navigate to FloorLayout page with booking params
  const handleSubmit = () => {
    if (!date || floor === "") {
      setMessage("Please select a date and floor.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    const entryTotal = entryHour * 60 + entryMinute;
    const exitTotal = exitHour * 60 + exitMinute;
    if (exitTotal <= entryTotal) {
      setMessage("Exit time must be after entry time.");
      setPopupType("error");
      setShowPopup(true);
      return;
    }

    // Format date consistently - use local date string in YYYY-MM-DD format
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("📅 DateBooking - Sending date:", {
      originalDate: date,
      formattedDate: formattedDate,
      selectedDate: selectedDate
    });

    // Navigate to FloorLayout with booking info + user
    navigate("/floorlayout", {
      state: {
        date: formattedDate,
        entryTime: `${pad(entryHour)}:${pad(entryMinute)}`,
        exitTime: `${pad(exitHour)}:${pad(exitMinute)}`,
        floor,
        user,
      },
    });
  };

  // Close popup handler
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // TimePicker reusable component for entry/exit time
  const TimePicker = ({ label, hour, minute, setHour, setMinute }) => {
    const incHour = () => setHour(hour === 23 ? 0 : hour + 1);
    const decHour = () => setHour(hour === 0 ? 23 : hour - 1);
    const incMinute = () => setMinute(minute === 59 ? 0 : minute + 1);
    const decMinute = () => setMinute(minute === 0 ? 59 : minute - 1);

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm font-semibold text-gray-700 tracking-wider uppercase">
          {label}
        </div>
        <div className="flex items-center space-x-2">
          {/* Hour Control */}
          <div className="flex flex-col items-center">
            <button 
              onClick={incHour} 
              className="p-1 hover:text-green-800 transition-colors"
              type="button"
            >
              <FaChevronUp className="w-3 h-3" />
            </button>
            <div className="bg-green-800 text-white font-semibold text-sm px-2.5 py-1.5 rounded min-w-[32px] text-center">
              {pad(hour)}
            </div>
            <div className="text-sm text-gray-500 mt-1">h</div>
            <button 
              onClick={decHour} 
              className="p-1 hover:text-green-800 transition-colors"
              type="button"
            >
              <FaChevronDown className="w-3 h-3" />
            </button>
          </div>
          
          {/* Minute Control */}
          <div className="flex flex-col items-center">
            <button 
              onClick={incMinute} 
              className="p-1 hover:text-green-800 transition-colors"
              type="button"
            >
              <FaChevronUp className="w-3 h-3" />
            </button>
            <div className="bg-green-800 text-white font-semibold text-sm px-2.5 py-1.5 rounded min-w-[32px] text-center">
              {pad(minute)}
            </div>
            <div className="text-sm text-gray-500 mt-1">m</div>
            <button 
              onClick={decMinute} 
              className="p-1 hover:text-green-800 transition-colors"
              type="button"
            >
              <FaChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main component JSX rendering with no scroll and proper viewport fitting
  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center overflow-hidden p-6">
      <div className="w-full max-w-md mx-auto flex flex-col max-h-screen overflow-hidden">
        {/* Title Section */}
        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Book your Seat
          </h2>
          <p className="text-base text-gray-600">
            Choose Date and Time
          </p>
        </div>

        {/* Main Booking Card - optimized for no scroll */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col space-y-4 flex-1 min-h-0 overflow-hidden">
          {/* Selected Date Display */}
          <div className="text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-lg py-3 px-4 flex-shrink-0">
            Selected Date: <span className="font-semibold text-gray-900">{date.toDateString()}</span>
          </div>

          {/* Calendar Section - brought closer to selected date */}
          <div className="calendar-container flex-shrink-0 -mt-2">
            <style jsx="true">{`
              .calendar-container .react-calendar {
                width: 100% !important;
                max-width: 320px !important;
                margin: 0 auto !important;
                border: none !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                font-family: inherit !important;
                background: white !important;
                padding: 0.75rem !important;
                font-size: 13px !important;
                height: auto !important;
                max-height: 260px !important;
                overflow: hidden !important;
              }
              
              .calendar-container .react-calendar__navigation {
                margin-bottom: 0.5rem !important;
                height: 32px !important;
              }
              
              .calendar-container .react-calendar__navigation button {
                font-size: 13px !important;
                padding: 0.25rem !important;
                min-width: 28px !important;
                height: 28px !important;
              }
              
              .calendar-container .react-calendar__month-view__weekdays {
                font-size: 11px !important;
                font-weight: 600 !important;
                margin-bottom: 0.5rem !important;
              }
              
              .calendar-container .react-calendar__month-view__weekdays__weekday {
                padding: 0.25rem !important;
              }
              
              .calendar-container .react-calendar__tile--active {
                background-color: #065f46 !important;  
                color: white !important;               
                border-radius: 50% !important;        
              }
              
              .calendar-container .react-calendar__tile--now {
                background-color: transparent !important;  
                color: inherit !important;                  
                font-weight: normal !important;
                background: none !important;
                border: none !important;
              }
              
              .calendar-container .react-calendar__tile--now.react-calendar__tile--active {
                background-color: #065f46 !important;
                color: white !important;
                border-radius: 50% !important;
              }
              
              .calendar-container .react-calendar__tile:hover {
                background-color: #ecfdf5 !important;
                color: #065f46 !important;
                border-radius: 4px !important;
              }
              
              .calendar-container .react-calendar__tile--active:hover {
                background-color: #065f46 !important;
                color: white !important;
                border-radius: 50% !important;
              }
              
              .calendar-container .react-calendar__tile {
                transition: none !important;
                border: none !important;
                padding: 0.25rem !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                font-size: 12px !important;
                height: 28px !important;
                max-width: 28px !important;
                margin: 1px !important;
              }
              
              .calendar-container .react-calendar__month-view__days {
                gap: 2px !important;
              }
            `}</style>
            <Calendar onChange={setDate} value={date} />
          </div>

          {/* Time Picker Section - reduced spacing */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-6">
              <TimePicker
                label="ENTRY TIME"
                hour={entryHour}
                minute={entryMinute}
                setHour={setEntryHour}
                setMinute={setEntryMinute}
              />
              <TimePicker
                label="EXIT TIME"
                hour={exitHour}
                minute={exitMinute}
                setHour={setExitHour}
                setMinute={setExitMinute}
              />
            </div>
          </div>

          {/* Floor Selection - reduced spacing */}
          <div className="flex-shrink-0">
            <label 
              className="block text-sm font-semibold text-gray-700 tracking-wider uppercase text-center mb-3"
              htmlFor="floor-select"
            >
              Choose Floor
            </label>
            <select
              id="floor-select"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Choose floor</option>
              {[...Array(32)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Floor {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button - moved higher */}
          <div className="flex-shrink-0">
            <button
              className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-3 px-4 rounded-md transition-colors text-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={handleSubmit}
              type="button"
            >
              DONE
            </button>
          </div>
        </div>

        {/* Popup with backdrop blur */}
        {showPopup && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50">
            <Popup message={message} onClose={handleClosePopup} type={popupType} />
          </div>
        )}
      </div>
    </div>
  );
}