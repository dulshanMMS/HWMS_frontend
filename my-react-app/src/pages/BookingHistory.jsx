import { useState, useEffect } from 'react';
// Import the navigation components created by your teammates
// Note: Comment these out until the components are available
// import LeftSidebar from '../components/LeftSidebar'; 
// import RightSidebar from '../components/RightSidebar';
import AdminLayout from "../components/AdminLayout";

export default function BookingHistory() {
  // State management
  const [activeTab, setActiveTab] = useState('Bookings'); // 'Bookings', 'Seat Bookings', 'Parking Bookings'
  const [bookingDates, setBookingDates] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    slotNumber: '',
    date: '',
    entryTime: '',
    exitTime: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    const fetchBookings = () => {
      // Mock data
      const mockDates = [
        { id: 1, date: '2022/02/19', bookings: [
          { slotNumber: 'A101', floorNo: '1', date: '2022/02/19', entryTime: '09:00', exitTime: '17:00' },
          { slotNumber: 'B205', floorNo: '2', date: '2022/02/19', entryTime: '10:30', exitTime: '15:45' }
        ]},
        { id: 2, date: '2022/02/18', bookings: [
          { slotNumber: 'C302', floorNo: '3', date: '2022/02/18', entryTime: '08:15', exitTime: '16:30' }
        ]},
        { id: 3, date: '2022/02/17', bookings: [
          { slotNumber: 'D405', floorNo: '4', date: '2022/02/17', entryTime: '11:00', exitTime: '19:00' }
        ]},
        { id: 4, date: '2022/02/16', bookings: [
          { slotNumber: 'E201', floorNo: '2', date: '2022/02/16', entryTime: '09:30', exitTime: '18:15' }
        ]},
        { id: 5, date: '2022/02/15', bookings: [
          { slotNumber: 'F103', floorNo: '1', date: '2022/02/15', entryTime: '10:00', exitTime: '17:30' }
        ]},
        { id: 6, date: '2022/02/14', bookings: [
          { slotNumber: 'G304', floorNo: '3', date: '2022/02/14', entryTime: '08:45', exitTime: '16:00' }
        ]},
        { id: 6, date: '2022/02/14', bookings: [
            { slotNumber: 'G304', floorNo: '3', date: '2022/02/14', entryTime: '08:45', exitTime: '16:00' }
          ]}
      ];

      setBookingDates(mockDates);
      
      // Calculate total bookings
      let total = 0;
      mockDates.forEach(date => {
        total += date.bookings.length;
      });
      setTotalBookings(total);
    };

    fetchBookings();
  }, [activeTab]); // Refetch when tab changes

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateClick = (date) => {
    setSelectedBooking(date);
    setShowDetailsPopup(true);
  };

  const handleDeleteClick = () => {
    setShowDetailsPopup(false);
    setShowDeletePopup(true);
    // Pre-fill delete form with selected booking details
    if (selectedBooking && selectedBooking.bookings.length > 0) {
      const booking = selectedBooking.bookings[0];
      setDeleteForm({
        slotNumber: booking.slotNumber,
        date: booking.date,
        entryTime: booking.entryTime,
        exitTime: booking.exitTime
      });
    }
  };

  const handleDeleteConfirm = () => {
    // Here you would make an API call to delete the booking
    console.log('Deleting booking:', deleteForm);
    
    // Close the popup and reset form
    setShowDeletePopup(false);
    setDeleteForm({
      slotNumber: '',
      date: '',
      entryTime: '',
      exitTime: ''
    });
    
    // Refresh bookings (simulated)
    // In a real app, you would refetch from the API
    const updatedDates = bookingDates.filter(date => 
      !(date.date === deleteForm.date && 
        date.bookings.some(b => b.slotNumber === deleteForm.slotNumber))
    );
    setBookingDates(updatedDates);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center"> {/*kalin methn tibbe ""flex" wlt wnkm witrii*/}
      {/* STEP 1: Left sidebar placeholder */}
      {/* When your teammate's component is ready, replace this div with: <LeftSidebar /> */}
      <div className="w-56 bg-green-800">
        {/* This is a placeholder for the left sidebar component */}
        <AdminLayout/>
        {/* Will be replaced with <LeftSidebar /> when available */}
      </div>
      
      {/* STEP 2: Main content area - this stays the same */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl bg-white shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-1">Your Booking History</h1>
            <p className="text-gray-600 mb-6">Welcome back!</p>
            
            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
              <button
                className={`py-2 px-4 ${activeTab === 'Bookings' ? 'border-b-2 border-green-700 font-medium' : ''}`}
                onClick={() => handleTabChange('Bookings')}
              >
                Bookings
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'Seat Bookings' ? 'border-b-2 border-green-700 font-medium' : ''}`}
                onClick={() => handleTabChange('Seat Bookings')}
              >
                Seat Bookings
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'Parking Bookings' ? 'border-b-2 border-green-700 font-medium' : ''}`}
                onClick={() => handleTabChange('Parking Bookings')}
              >
                Parking Bookings
              </button>
            </div>
            
            {/* Stats Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Quick Stats</h2>
              <div className="bg-white p-4 border rounded-lg shadow-sm inline-block">
                <p className="text-sm text-gray-600">Your Total Bookings:</p>
                <p className="text-3xl font-bold">{totalBookings}</p>
              </div>
            </div>
            
            {/* Booking Dates Grid */}
            <div className="grid grid-cols-2 gap-4">
              {bookingDates.map((date) => (
                <button
                  key={date.id}
                  className="bg-white p-4 border rounded-lg shadow-sm text-left hover:bg-gray-50 transition flex items-center"
                  onClick={() => handleDateClick(date)}
                >
                  <span className="text-green-800">
                    ❯
                  </span>
                  <span className="ml-2">{date.date}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* STEP 3: Right sidebar placeholder */}
      {/* When your teammate's component is ready, replace this div with: <RightSidebar /> */}
      <div className="w-64 bg-white">
        {/* This is a placeholder for the right sidebar component */}
        <AdminLayout/>
        {/* Will be replaced with <RightSidebar /> when available */}
      </div>
      
      {/* Booking Details Popup */}
      {showDetailsPopup && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Booking Details for {selectedBooking.date}</h2>
            
            {selectedBooking.bookings.map((booking, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-600">Slot Number:</p>
                  <p className="font-medium">{booking.slotNumber}</p>
                  
                  <p className="text-gray-600">Floor Number:</p>
                  <p className="font-medium">{booking.floorNo}</p>
                  
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">{booking.date}</p>
                  
                  <p className="text-gray-600">Entry Time:</p>
                  <p className="font-medium">{booking.entryTime}</p>
                  
                  <p className="text-gray-600">Exit Time:</p>
                  <p className="font-medium">{booking.exitTime}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={handleDeleteClick}
              >
                Delete Booking
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowDetailsPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Please confirm the booking details to delete:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Number</label>
                <input
                  type="text"
                  name="slotNumber"
                  value={deleteForm.slotNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (YYYY/MM/DD)</label>
                <input
                  type="text"
                  name="date"
                  value={deleteForm.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time</label>
                <input
                  type="text"
                  name="entryTime"
                  value={deleteForm.entryTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
                <input
                  type="text"
                  name="exitTime"
                  value={deleteForm.exitTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}