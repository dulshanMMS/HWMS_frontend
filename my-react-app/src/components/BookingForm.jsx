import React, { useState } from "react";
import CustomDatePicker from "./datePicker";
import TimePicker from "./TimePicker";
import FloorSelector from "./FloorSelector";
import SlotSelector from "./Slotselector";

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Date:", selectedDate);
    console.log("Entry Time:", entryTime);
    console.log("Exit Time:", exitTime);
    console.log("Selected Floor:", selectedFloor);
    console.log("Selected Slot:", selectedSlot);
    alert("Booking submitted!");
  };

  const handleCancel = () => {
    setSelectedDate(new Date());
    setEntryTime("");
    setExitTime("");
    setSelectedFloor("");
    setSelectedSlot("");
  };

  return (
     <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">   {/* Ethule element wala ui handleinggg*/}
           {/* aluthin dpuek*/}

      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-15 mt-6">Book Your Parking Slot</h1>   {/* kalint tibbe mb-6 pamani */}
      <form onSubmit={handleSubmit}>
      {/* Main layout with 3 columns */}
      <div className="grid grid-cols-3 gap-17"> {/* methn kalin gap ekt 6 tibbe */}
        {/* Left Column: Date Picker & Time Pickers */}
        <div className="space-y-4">
          <CustomDatePicker
            selectedDate={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
          <TimePicker
            label="Entry Time"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
          />
          <TimePicker
            label="Exit Time"
            value={exitTime}
            onChange={(e) => setExitTime(e.target.value)}
          />
        </div>

        {/* Middle Column: Floor Selector */}
        <div className="flex flex-col justify-start">
          <FloorSelector
            selectedFloor={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
          />
        </div>

        {/* Right Column: Slot Selector if you want (only shows if a floor is selected) -> WTSAPP dala ethi code ek */}
        <div>
          
            <SlotSelector
              selectedFloor={selectedFloor}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          
        </div>
      </div>

      {/* Buttons Section: Full width below the grid */}
      <div className="flex justify-center gap-x-4 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="w-1/4 p-2 bg-gray-300 text-black rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-1/4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Book Now
        </button>
      </div>
      </form>
    </div>
  );
};

export default BookingForm;

