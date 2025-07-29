import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
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
  const [user, setUser] = useState('');
  
  // NEW: States for conflict management
  const [availableFloors, setAvailableFloors] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingBookingId, setExistingBookingId] = useState(null);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);

  // Decode JWT to get the logged-in user's userName
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.userName || decoded.username);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  // Initialize available floors on component mount
  useEffect(() => {
    const allFloors = [];
    for (let i = 1; i <= 32; i++) {
      allFloors.push({ id: i, name: `Floor ${i}` });
    }
    setAvailableFloors(allFloors);
  }, []);

  // NEW: Check for booking conflicts and update available floors
  const checkBookingConflicts = async () => {
    if (!user || !date) return;

    setIsLoadingFloors(true);
    
    try {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const entryTime = `${pad(entryHour)}:${pad(entryMinute)}`;
      const exitTime = `${pad(exitHour)}:${pad(exitMinute)}`;

      console.log('🔍 Checking conflicts for:', {
        userName: user,
        date: formattedDate,
        entryTime,
        exitTime
      });

      const response = await fetch('http://localhost:6001/api/bookings/check-user-conflict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userName: user,
          date: formattedDate,
          entryTime: entryTime,
          exitTime: exitTime
        })
      });

      const data = await response.json();
      console.log('📋 Conflict check response:', data);

      if (data.hasConflict) {
        // User has existing booking at this time - show only that floor
        console.log(`⚠️ Conflict found on Floor ${data.existingFloor}`);
        setAvailableFloors([{ id: data.existingFloor, name: `Floor ${data.existingFloor}` }]);
        setFloor(data.existingFloor.toString());
        setIsEditMode(true);
        setExistingBookingId(data.bookingId);
        // Silently switch to edit mode without showing popup
      } else {
        // No conflict - show all floors (32 floors available)
        console.log('✅ No conflicts found - showing all floors');
        const allFloors = [];
        for (let i = 1; i <= 32; i++) {
          allFloors.push({ id: i, name: `Floor ${i}` });
        }
        setAvailableFloors(allFloors);
        setIsEditMode(false);
        setExistingBookingId(null);
        setFloor(""); // Reset floor selection
      }
    } catch (error) {
      console.error('❌ Error checking booking conflicts:', error);
      // Fallback to show all floors
      const allFloors = [];
      for (let i = 1; i <= 32; i++) {
        allFloors.push({ id: i, name: `Floor ${i}` });
      }
      setAvailableFloors(allFloors);
      setIsEditMode(false);
      setExistingBookingId(null);
    } finally {
      setIsLoadingFloors(false);
    }
  };

  // NEW: Effect to check conflicts when date/time changes
  useEffect(() => {
    if (user) {
      // Debounce the conflict check to avoid too many API calls
      const timeoutId = setTimeout(() => {
        checkBookingConflicts();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [date, entryHour, entryMinute, exitHour, exitMinute, user]);

  // Helper to pad numbers <10 with a leading zero for display
  const pad = (num) => (num < 10 ? "0" + num : num);

  // Validate booking date and time - includes past time validation
  const validateBookingDateTime = () => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (selectedDate < today) {
      return {
        isValid: false,
        message: "Can't book for past dates"
      };
    }
    
    // Check if booking is for today and time has already passed
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const entryTime = new Date();
      entryTime.setHours(entryHour, entryMinute, 0, 0);
      
      if (entryTime < now) {
        const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const requestedTime = `${pad(entryHour)}:${pad(entryMinute)}`;
        return {
          isValid: false,
          message: `Can't book for past times. Current time is ${currentTime}, but you're trying to book for ${requestedTime}.`
        };
      }
    }
    
    return { isValid: true };
  };

  // Validate inputs and navigate to FloorLayout page with booking params
  const handleSubmit = () => {
    // Basic field validation first
    if (!date || floor === "") {
      setMessage("Please select a date and floor.");
      setShowPopup(true);
      return;
    }

    // Time logic validation
    const entryTotal = entryHour * 60 + entryMinute;
    const exitTotal = exitHour * 60 + exitMinute;
    if (exitTotal <= entryTotal) {
      setMessage("Exit time must be after entry time.");
      setShowPopup(true);
      return;
    }

    // Date and time validation (includes past time checking)
    const dateTimeValidation = validateBookingDateTime();
    if (!dateTimeValidation.isValid) {
      setMessage(dateTimeValidation.message);
      setShowPopup(true);
      return;
    }

    // All validations passed - format date and navigate
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    console.log('🚀 Navigating to FloorLayout with:', {
      date: formattedDate,
      entryTime: `${pad(entryHour)}:${pad(entryMinute)}`,
      exitTime: `${pad(exitHour)}:${pad(exitMinute)}`,
      floor,
      user,
      isEditMode,
      existingBookingId
    });

    // Navigate to FloorLayout with booking info + user + edit mode info
    navigate("/floorlayout", {
      state: {
        date: formattedDate,
        entryTime: `${pad(entryHour)}:${pad(entryMinute)}`,
        exitTime: `${pad(exitHour)}:${pad(exitMinute)}`,
        floor,
        user,
        isEditMode,
        existingBookingId
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

  return (
    <div className="w-full h-screen bg-green-100 flex items-center justify-center overflow-hidden m-0 p-0">
      <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center h-[90%] overflow-hidden px-4 bg-green-100 rounded-xl shadow-md">

        {/* Title Section */}
        <div className="text-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {isEditMode ? "Edit your Booking" : "Book your Seat"}
          </h2>
          <p className="text-base text-gray-600">
            Choose Date and Time
          </p>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4 flex-1 min-h-0 overflow-hidden border border-gray-200">
          {/* Selected Date Display */}
          <div className="text-center text-sm font-medium text-gray-700 bg-green-50 rounded-xl py-3 px-4 flex-shrink-0">
            Selected Date: <span className="font-semibold text-gray-900">{date.toDateString()}</span>
          </div>

          {/* Calendar Section */}
          <div className="calendar-container">
            <style jsx="true">{`
              .calendar-container .react-calendar {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                border: none !important;
                border-radius: 12px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                font-family: inherit !important;
                background: white !important;
                padding: 0.75rem !important;
                font-size: 13px !important;
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
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: 1px !important;
              }
              
              .calendar-container .react-calendar__month-view__weekdays__weekday {
                padding: 0.25rem !important;
                text-align: center !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 28px !important;
              }
              
              .calendar-container .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none !important;
                font-weight: 600 !important;
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
              
              .calendar-container .react-calendar__month-view__days {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: 1px !important;
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
                width: 100% !important;
                margin: 0 !important;
                min-width: 28px !important;
              }
            `}</style>
            <Calendar onChange={setDate} value={date} />
          </div>

          {/* Time Picker Section */}
          <div>
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

          {/* Floor Selection with conflict handling */}
          <div>
            <label 
              className="block text-sm font-semibold text-gray-700 tracking-wider uppercase text-center mb-3"
              htmlFor="floor-select"
            >
              {isEditMode ? "Your Booked Floor" : "Choose Floor"}
            </label>
            
            {isLoadingFloors ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center text-gray-500">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-800 mr-2"></div>
                  Checking availability...
                </div>
              </div>
            ) : (
              <select
                id="floor-select"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                disabled={isEditMode}
                className={`w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">
                  {availableFloors.length === 0 ? "No floors available" : "Choose floor"}
                </option>
                {availableFloors.map((floorOption) => (
                  <option key={floorOption.id} value={floorOption.id}>
                    {floorOption.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              type="button"
              disabled={isLoadingFloors || availableFloors.length === 0}
            >
              {isEditMode ? "EDIT BOOKING" : "DONE"}
            </button>
          </div>
        </div>

        {/* Popup for messages */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Booking Error
                </h3>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  {message}
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleClosePopup}
                  className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}