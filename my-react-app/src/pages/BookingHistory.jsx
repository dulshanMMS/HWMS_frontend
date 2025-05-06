import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import AdminLayout from "../components/AdminLayout";
// You can uncomment these when the components are available
// import LeftSidebar from '../components/LeftSidebar';
// import RightSidebar from '../components/RightSidebar';

// API base URL - adjust if needed
const API_BASE_URL = 'http://localhost:5000/api';

export default function BookingHistory() {
  // State management
  const [activeTab, setActiveTab] = useState('Parking Bookings'); // Default to Parking Bookings
  const [bookingDates, setBookingDates] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteForm, setDeleteForm] = useState({
    slotNumber: '',
    date: '',
    entryTime: '',
    exitTime: ''
  });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch booking history data when component mounts or tab changes
  useEffect(() => {
    fetchBookingHistory();
  }, [activeTab]); // Refetch when tab changes

  // Fetch booking history from API
  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine booking type based on active tab
      let bookingType = "parking"; // Default to parking
      
      if (activeTab === 'Seat Bookings') {
        bookingType = "seat";
      }
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Make API request to get booking history
      const response = await axios.post(
        `${API_BASE_URL}/history/user`,
        { type: bookingType },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Process the data
      const { totalBookings, bookedDates } = response.data;
      
      // Format dates to match your UI
      const formattedDates = bookedDates.map((date, index) => ({
        id: index + 1,
        date: date,
        bookings: [] // We'll fetch detailed bookings when a date is clicked
      }));
      
      setTotalBookings(totalBookings);
      setBookingDates(formattedDates);
      
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking details for a specific date
  const fetchBookingDetails = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine booking type
      let bookingType = "parking"; // Default to parking
      
      if (activeTab === 'Seat Bookings') {
        bookingType = "seat";
      }
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Make API request to get booking details for the selected date
      const response = await axios.post(
        `${API_BASE_URL}/history/user/details`,
        { 
          type: bookingType,
          date: date 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setBookingDetails(response.data);
      
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  // Delete a booking
  const deleteBooking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Make API request to delete the booking
      await axios.delete(
        `${API_BASE_URL}/history/user/delete`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            slotNumber: parseInt(deleteForm.slotNumber), // Convert to number if needed
            date: deleteForm.date,
            entryTime: deleteForm.entryTime,
            exitTime: deleteForm.exitTime
          }
        }
      );
      
      // Close delete popup
      setShowDeletePopup(false);
      
      // Clear form
      setDeleteForm({
        slotNumber: '',
        date: '',
        entryTime: '',
        exitTime: ''
      });
      
      // Refresh booking history
      fetchBookingHistory();
      
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete booking');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateClick = (date) => {
    setSelectedBooking(date);
    fetchBookingDetails(date.date);
    setShowDetailsPopup(true);
  };

  const handleDeleteClick = (booking) => {
    setShowDetailsPopup(false);
    setShowDeletePopup(true);
    
    // Pre-fill delete form with selected booking details
    setDeleteForm({
      slotNumber: booking.slotNumber.toString(),
      date: booking.date,
      entryTime: booking.entryTime,
      exitTime: booking.exitTime
    });
  };

  const handleDeleteConfirm = () => {
    deleteBooking();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      {/* STEP 1: Left sidebar placeholder */}
      <div className="w-56 bg-green-800">
        <AdminLayout/>
        {/* Will be replaced with <LeftSidebar /> when available */}
      </div>
      
      {/* STEP 2: Main content area */}
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
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Stats Section */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Quick Stats</h2>
              <div className="bg-white p-4 border rounded-lg shadow-sm inline-block">
                <p className="text-sm text-gray-600">Your Total Bookings:</p>
                <p className="text-3xl font-bold">
                  {loading ? 'Loading...' : totalBookings}
                </p>
              </div>
            </div>
            
            {/* Booking Dates Grid */}
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 text-center py-4">Loading booking dates...</div>
              ) : bookingDates.length > 0 ? (
                bookingDates.map((date) => (
                  <button
                    key={date.id}
                    className="bg-white p-4 border rounded-lg shadow-sm text-left hover:bg-gray-50 transition flex items-center"
                    onClick={() => handleDateClick(date)}
                  >
                    <span className="text-green-800">❯</span>
                    <span className="ml-2">{date.date}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-gray-500">
                  No booking dates found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* STEP 3: Right sidebar placeholder */}
      <div className="w-64 bg-white">
        <AdminLayout/>
        {/* Will be replaced with <RightSidebar /> when available */}
      </div>
      
      {/* Booking Details Popup */}
      {showDetailsPopup && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Booking Details for {selectedBooking.date}</h2>
            
            {loading ? (
              <div className="text-center py-4">Loading booking details...</div>
            ) : bookingDetails.length > 0 ? (
              bookingDetails.map((booking, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-gray-600">Slot Number:</p>
                    <p className="font-medium">{booking.slotNumber}</p>
                    
                    <p className="text-gray-600">Floor Number:</p>
                    <p className="font-medium">{booking.floor}</p>
                    
                    <p className="text-gray-600">Date:</p>
                    <p className="font-medium">{booking.date}</p>
                    
                    <p className="text-gray-600">Entry Time:</p>
                    <p className="font-medium">{booking.entryTime}</p>
                    
                    <p className="text-gray-600">Exit Time:</p>
                    <p className="font-medium">{booking.exitTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No booking details found
              </div>
            )}
            
            <div className="flex justify-end mt-4 space-x-2">
              {bookingDetails.length > 0 && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={() => handleDeleteClick(bookingDetails[0])}
                >
                  Delete Booking
                </button>
              )}
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
            
            {/* Error message in delete form */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
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
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
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