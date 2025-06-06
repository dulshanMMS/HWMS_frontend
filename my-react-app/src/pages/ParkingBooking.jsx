import React, { useState, useEffect } from "react";
import { fetchAvailableSlots, bookParkingSlot } from "../api/parkingApi";
import LoadingScreen from "../components/parking/LoadingScreen";
import BookingForm from "../components/parking/BookingForm";
import AvailableSlots from "../components/parking/Availableslots";
import BookButton from "../components/parking/Bookbutton";
import MessageBox from "../components/parking/Messagebox";

const ParkingBooking = () => {
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [date, setDate] = useState("");
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [floor, setFloor] = useState("1");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setAvailableSlots([]);
    } catch {
      setMessage("Failed to book the slot.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingScreen) return <LoadingScreen />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100 px-4">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-4xl min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-center text-green-600 p-10">Parking Slot Booking</h1>

        <BookingForm
          date={date}
          entryTime={entryTime}
          exitTime={exitTime}
          floor={floor}
          onDateChange={e => setDate(e.target.value)}
          onEntryTimeChange={e => setEntryTime(e.target.value)}
          onExitTimeChange={e => setExitTime(e.target.value)}
          onFloorChange={e => setFloor(e.target.value)}
        />

        <div className="flex justify-center">
          <button
            onClick={handleCheckAvailability}
            className="btn btn-primary mt-16 w-1/3 p-4 bg-green-900 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Available Slots"}
          </button>
        </div>

        <AvailableSlots slots={availableSlots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />

        <BookButton selectedSlot={selectedSlot} onBook={handleBooking} loading={loading} />

        <MessageBox message={message} />
      </div>
    </div>
  );
};

export default ParkingBooking;
