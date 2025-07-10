import { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileSidebar from '../components/ProfileSidebar';
import AdminSidebar from '../components/AdminSidebar';

import BookingStats from '../components/parkingHistory/BookingStats';
import BookingDatesList from '../components/parkingHistory/BookingDatesList';
import BookingDetailsPopup from '../components/parkingHistory/BookingDetailsPopup';
import DeleteBookingPopup from '../components/parkingHistory/DeleteBookingPopup';
import ErrorMessage from '../components/parkingHistory/ErrorMessage';

const API_BASE_URL = 'http://localhost:5000/api';

export default function BookingHistory() {
  
   // State managements
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

  // Fetch history data when component mounts
  useEffect(() => {
    fetchBookingHistory();
  }, []); // Only fetch once on component mount

  // Fetch booking history from API
  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always use "parking" type
      const bookingType = "parking";
      
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
        bookings: [] // already detailed bookings data comes when a date is clicked
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
      
      const bookingType = "parking";
      
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

  const handleDateClick = (date) => {
    setSelectedBooking(date);
    fetchBookingDetails(date.date);
    setShowDetailsPopup(true);
  };

  const handleDeleteClick = (booking) => {
    setShowDetailsPopup(false);
    setShowDeletePopup(true);
    
    // delete form with selected booking details(it is already pre filled !!!)
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
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-64 h-full bg-green-800 text-white">
        <AdminSidebar />
      </div>

      <div className="flex-1 overflow-y-auto bg-green-50">
        <div className="flex justify-center py-6 px-4">
          <div className="w-full max-w-3xl bg-white shadow rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-1">Your Booking History</h1>
              <p className="text-gray-600 mb-6">Welcome back!</p>

              <div className="flex border-b mb-6">
                <div className="py-2 px-4">About your Parking Bookings</div>
              </div>

              {error && <ErrorMessage message={error} />}

              <BookingStats totalBookings={totalBookings} loading={loading} />

              <div className="grid grid-cols-2 gap-4">
                <BookingDatesList
                  bookingDates={bookingDates}
                  loading={loading}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-64 h-full bg-white shadow-md">
        <ProfileSidebar/>
      </div>

      {showDetailsPopup && selectedBooking && (
        <BookingDetailsPopup
          selectedBooking={selectedBooking}
          bookingDetails={bookingDetails}
          loading={loading}
          onClose={() => setShowDetailsPopup(false)}
          onDeleteClick={() => {
            setShowDetailsPopup(false);
            setShowDeletePopup(true);
            setDeleteForm({
              slotNumber: bookingDetails[0]?.slotNumber.toString() || '',
              date: bookingDetails[0]?.date || '',
              entryTime: bookingDetails[0]?.entryTime || '',
              exitTime: bookingDetails[0]?.exitTime || ''
            });
          }}
        />
      )}

      {showDeletePopup && (
        <DeleteBookingPopup
          deleteForm={deleteForm}
          onInputChange={handleInputChange}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeletePopup(false)}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
