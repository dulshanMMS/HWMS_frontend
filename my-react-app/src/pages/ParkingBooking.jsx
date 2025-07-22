import React, { useState, useEffect } from "react";
import { fetchAvailableSlots, bookParkingSlot } from "../api/parkingApi";
import LoadingScreen from "../components/parking/LoadingScreen";
import BookingForm from "../components/parking/BookingForm";
import AvailableSlots from "../components/parking/Availableslots";
import BookButton from "../components/parking/Bookbutton";
import MessageBox from "../components/parking/Messagebox";
import LeftSidebar from "../components/LeftSidebar";
import RatingModal from "../components/ratingModal"; // Importing the RatingModal component
import { getProfile } from "../api/userApi"; // Import userApi for ratingModal

//import SidebarWrapper from '../components/profilesidebar/SidebarWrapper';
//methn1

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
  const [isRatingOpen, setIsRatingOpen] = useState(false);//ratingModal original
  // const [isRatingOpen, setIsRatingOpen] = useState(false);//ratingModal test button
  const [userId, setUserId] = useState(null); // State for userId for ratingModal

  useEffect(() => {
  //for ratingmodal
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error('No token found in localStorage');
          setMessage('Please log in to submit ratings.');
          return;
        }
        const profile = await getProfile(token);
        if (!profile._id) {
          console.error('No userId found in profile:', profile);
          setMessage('Unable to fetch user profile.');
          return;
        }
        setUserId(profile._id);
      } catch (error) {
        console.error('Failed to fetch user profile:', error.message);
        setMessage('Failed to fetch user profile. Please log in again.');
      }
    };

    fetchUserProfile();
//for ratingmodal

    const timer = setTimeout(() => setLoadingScreen(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Function to check if selected date is in the past
  const isDateInPast = (selectedDate) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    
    // Set time to beginning of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    
    return selected < today;
  };

  const handleCheckAvailability = async () => {
    setLoading(true);
    setMessage("");
    
    // Check if all required fields are filled
    if (!date) {
      setMessage("Please select a date.");
      setLoading(false);
      return;
    }
    
    if (!entryTime) {
      setMessage("Please select an entry time.");
      setLoading(false);
      return;
    }
    
    if (!exitTime) {
      setMessage("Please select an exit time.");
      setLoading(false);
      return;
    }
    
    // Check if exit time is after entry time
    if (entryTime >= exitTime) {
      setMessage("Exit time must be after entry time.");
      setLoading(false);
      return;
    }
    
    // Check if selected date is in the past
    if (isDateInPast(date)) {
      setMessage("You cannot select a past date. Please select today or a future date.");
      setLoading(false);
      setAvailableSlots([]); // Clear any existing slots
      setSelectedSlot(null); // Clear selected slot
      return;
    }

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
      if (Math.random() < 1) setIsRatingOpen(true); // Randomly open rating modal 50% chance
      
    } catch {
      setMessage("Failed to book the slot.");
    } finally {
      setLoading(false);
    }
  };

  //const [sidebarOpen, setSidebarOpen] = useState(true); // or false based on what you want
  // * *methn 2

  if (loadingScreen) return <LoadingScreen />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <LeftSidebar />

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

      {/*<SidebarWrapper                          // * * methn 3
        sidebarOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      /> */}

     {/* <button   //ratingmodal test button
       onClick={() => setIsRatingOpen(true)}
       className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
           Test Seating Rating
     </button> */}
      
    

   <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch('/api/ratings/submit-rating', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, bookingType: 'parking', ...data }),
            });
            return response; // Ensure response is returned
          } catch (error) {
            console.error('Fetch error in onSubmit:', error.message);
            throw error; // Rethrow to be caught in handleSubmit
          }
        }}
        userId={userId}
      />

    </div>
  );
};

export default ParkingBooking;