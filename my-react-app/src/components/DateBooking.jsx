import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/DateBooking.css";
import LeftSidebar from './LeftSidebar';
import Popup from "./Popup";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import { jwtDecode } from "jwt-decode";

export default function DateBooking() {
  const navigate = useNavigate();

  // States used for date/time/floor selection and popup messages
  const [date, setDate] = useState(new Date());// Selected booking date
  const [entryHour, setEntryHour] = useState(9);// Entry time hour (0-23)
  const [entryMinute, setEntryMinute] = useState(0);// Entry time minute (0-59)
  const [exitHour, setExitHour] = useState(10);// Exit time hour (0-23)
  const [exitMinute, setExitMinute] = useState(0);// Exit time minute (0-59)
  const [floor, setFloor] = useState("");// Selected floor number
  const [showPopup, setShowPopup] = useState(false);// Popup visibility for messages
  const [message, setMessage] = useState("");// Popup message content
  const [popupType, setPopupType] = useState("error"); // Popup type: "error" or "success"
  const [user, setUser] = useState(''); // Store decoded username from JWT

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
    selectedDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // Convert to YYYY-MM-DD format (avoids timezone issues)
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
        date: formattedDate, // Send YYYY-MM-DD format instead of ISO string
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
      <div className="time-picker">
        <div className="time-label">{label}</div>
        <div className="time-control">
          <div className="time-unit">
            <button onClick={incHour} className="arrow-btn" type="button">
              <FaChevronUp />
            </button>
            <div className="time-value">{pad(hour)}</div>
            <div className="time-unit-label">h</div>
            <button onClick={decHour} className="arrow-btn" type="button">
              <FaChevronDown />
            </button>
          </div>
          <div className="time-unit">
            <button onClick={incMinute} className="arrow-btn" type="button">
              <FaChevronUp />
            </button>
            <div className="time-value">{pad(minute)}</div>
            <div className="time-unit-label">m</div>
            <button onClick={decMinute} className="arrow-btn" type="button">
              <FaChevronDown />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main component JSX rendering
  return (
    <LeftSidebar>
      <div className="booking-page-layout">
        <div className="booking-middle-section">
          <h2 className="booking-title">Book your Seat</h2>
          <p className="sub-title">Choose Date and Time</p>

          <div className="booking-boxes">
            <div className="booking-card">
              <div className="selected-date-display">
                Selected Date: <strong>{date.toDateString()}</strong>
              </div>

              <Calendar onChange={setDate} value={date} />

              <div className="time-picker-row" style={{ marginTop: "1rem" }}>
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

              <label className="time-label" htmlFor="floor-select">Choose Floor</label>
              <select
                id="floor-select"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="booking-input"
              >
                <option value="">Choose floor</option>
                {[...Array(32)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Floor {i + 1}
                  </option>
                ))}
              </select>

              <button
                className="submit-button"
                onClick={handleSubmit}
                style={{ marginTop: "1.5rem" }}
                type="button"
              >
                DONE
              </button>
            </div>
          </div>

          {showPopup && (
            <Popup message={message} onClose={handleClosePopup} type={popupType} />
          )}
        </div>
      </div>
    </LeftSidebar>
  );
}