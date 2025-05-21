import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/DateBooking.css";
import Popup from "./Popup";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Replace with 'next/navigation' useRouter if using Next.js

export default function DateBooking() {
  const navigate = useNavigate();

  // States used for date/time/floor selection and popup messages
  const [date, setDate] = useState(new Date());
  const [entryHour, setEntryHour] = useState(9);
  const [entryMinute, setEntryMinute] = useState(0);
  const [exitHour, setExitHour] = useState(10);
  const [exitMinute, setExitMinute] = useState(0);
  const [floor, setFloor] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("error"); // or "success"

  const pad = (num) => (num < 10 ? "0" + num : num);

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

    // Navigate to FloorLayout page with booking details as query params
    const bookingParams = new URLSearchParams({
      date: date.toISOString(),
      entryTime: `${pad(entryHour)}:${pad(entryMinute)}`,
      exitTime: `${pad(exitHour)}:${pad(exitMinute)}`,
      floor,
    }).toString();

    navigate(`/floorlayout?${bookingParams}`);
  };

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

  return (
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
  );
}
