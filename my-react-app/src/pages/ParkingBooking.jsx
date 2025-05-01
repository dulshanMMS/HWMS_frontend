//import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import { fetchAvailableSlots, bookParkingSlot } from "../api/parkingApi";

const ParkingBooking = () => {
  const [loadingScreen, setLoadingScreen] = useState(true); // Show car loading initially  
  const [date, setDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [floor, setFloor] = useState("1");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);



  // Show animated car screen for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoadingScreen(false), 2000);
    return () => clearTimeout(timer);
  }, []);



  const handleCheckAvailability = async () => {
    setLoading(true);
    setMessage("");
    try {
      const slots = await fetchAvailableSlots({ date, entryTime, exitTime, floor: Number(floor) });
      setAvailableSlots(slots);
      if (slots.length === 0) setMessage("No available slots found.");
    } catch {
      setMessage("Failed to fetch available slots.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    setMessage("");
    try {
      const result = await bookParkingSlot({ slotNumber: selectedSlot, date, entryTime, exitTime });
      setMessage(result.message || "Booking completed!");
      setSelectedSlot(null);
      setAvailableSlots([]); // Reset to force new selection
    } catch {
      setMessage("Failed to book the slot.");
    } finally {
      setLoading(false);
    }
  };
   
   // Show loading animation
  if (loadingScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-4xl animate-bounce transition-all duration-700">
        <span role="img" aria-label="car">🚗</span>
        <p className="text-lg mt-2 animate-pulse">Stop your engine...</p>
      </div>
    );
  }


  // Booking form UI
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-4xl min-h-screen">  {/* min-h-screen mek dala thmi form ek basicaly sprim usata gatte */}
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600 p-10">Parking Slot Booking</h1>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <input type="date" className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" value={date} onChange={e => setDate(e.target.value)} />
          <input type="time" className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" value={entryTime} onChange={e => setEntryTime(e.target.value)} />
          <input type="time" className="input text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" value={exitTime} onChange={e => setExitTime(e.target.value)} />
          <select className="input  text-black rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" value={floor} onChange={e => setFloor(e.target.value)}>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
        </div>
        <div className="flex justify-center">
        <button
          onClick={handleCheckAvailability}
          className="btn btn-primary mt-16 w-1/3 p-4 bg-green-900"   // button eke padding and margin 
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Available Slots"}
        </button>
        </div>
        {/* Slot List */}
        {availableSlots.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-green-600">Available Slots:</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.slotNumber}
                  className={`p-2 border rounded-md ${
                    selectedSlot === slot.slotNumber ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-green-100'
                  }`}
                  onClick={() => setSelectedSlot(slot.slotNumber)}
                >
                  Slot {slot.slotNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Now */}
        {selectedSlot && (
         <div className="flex justify-center">   
          <button
            onClick={handleBooking}
            className="btn btn-primary mt-16 w-1/3 p-4 bg-green-900"  //btn btn-primary mt-16 w-1/3 p-4 
            disabled={loading}
          >
            {loading ? "Booking..." : `Book Slot ${selectedSlot}`}
          </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingBooking;
