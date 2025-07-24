import { useState, useEffect } from 'react';
import axios from 'axios';
import LeftSidebar from "../components/LeftSidebar";

import SeatBookingStats from '../components/seatHistory/SeatBookingStats';
import SeatBookingDatesList from '../components/seatHistory/SeatBookingDatesList';
import SeatBookingDetailsPopup from '../components/seatHistory/SeatBookingDetailsPopup';
import DeleteSeatBookingPopup from '../components/seatHistory/DeleteSeatBookingPopup';
import ErrorMessage from '../components/seatHistory/ErrorMessage';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SeatHistory() {
  
  // State managements
  const [bookingDates, setBookingDates] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [teamInfo, setTeamInfo] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [deleteForm, setDeleteForm] = useState({
    bookingId: '',
    seatId: '',
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
    fetchTeamInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on component mount

  // Fetch team information
  const fetchTeamInfo = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await axios.get(
        `${API_BASE_URL}/seathistory/user/team`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setTeamInfo(response.data);
    } catch (err) {
      console.error('Error fetching team info:', err);
      // Don't show error for team info as it's optional
    }
  };

  // Fetch booking history from API
  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always use "seat" type
      const bookingType = "seat";
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Make API request to get booking history
      const response = await axios.post(
        `${API_BASE_URL}/seathistory/user`,
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
        bookings: [] // detailed bookings data comes when a date is clicked
      }));
      
      setTotalBookings(totalBookings);
      setBookingDates(formattedDates);
      
    } catch (err) {
      console.error('Error fetching seat booking history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch seat booking history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking details for a specific date
  const fetchBookingDetails = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
      const bookingType = "seat";
      
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Make API request to get booking details for the selected date
      const response = await axios.post(
        `${API_BASE_URL}/seathistory/user/details`,
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
      console.error('Error fetching seat booking details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch seat booking details');
    } finally {
      setLoading(false);
    }
  };

  // Delete a seat booking
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
        `${API_BASE_URL}/seathistory/user/delete`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            bookingId: deleteForm.bookingId,
            seatId: deleteForm.seatId,
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
        bookingId: '',
        seatId: '',
        date: '',
        entryTime: '',
        exitTime: ''
      });
      
      // Refresh booking history
      fetchBookingHistory();
      
    } catch (err) {
      console.error('Error deleting seat booking:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete seat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedBooking(date);
    fetchBookingDetails(date.date);
    setShowDetailsPopup(true);
  };

  // This function is used in the popup component through onDeleteClick prop
  // const handleDeleteClick = (booking) => {
  //   setShowDetailsPopup(false);
  //   setShowDeletePopup(true);
  //   
  //   // Pre-fill delete form with selected booking details
  //   setDeleteForm({
  //     bookingId: booking.bookingId || '',
  //     seatId: booking.seatId || '',
  //     date: booking.date || '',
  //     entryTime: booking.entryTime || '',
  //     exitTime: booking.exitTime || ''
  //   });
  // };

  const handleDeleteConfirm = () => {
    deleteBooking();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If bookingId is being set, find and populate other fields
    if (name === 'bookingId' && value && bookingDetails.length > 0) {
      const selectedBooking = bookingDetails.find(b => b.bookingId === value);
      if (selectedBooking) {
        setDeleteForm(prev => ({
          ...prev,
          seatId: selectedBooking.seatId,
          date: selectedBooking.date,
          entryTime: selectedBooking.entryTime,
          exitTime: selectedBooking.exitTime
        }));
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      <LeftSidebar />

      <div className="flex-1 overflow-y-auto bg-green-50">
        <div className="flex justify-center py-6 px-4">
          <div className="w-full max-w-3xl bg-white shadow rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-1">Your Seat Booking History</h1>
              <p className="text-gray-600 mb-6">Welcome back!</p>

              <div className="flex border-b mb-6">
                <div className="py-2 px-4">About your Seat Bookings</div>
              </div>

              {error && <ErrorMessage message={error} />}

              <SeatBookingStats 
                totalBookings={totalBookings} 
                teamInfo={teamInfo}
                loading={loading} 
              />

              <div className="grid grid-cols-2 gap-4">
                <SeatBookingDatesList
                  bookingDates={bookingDates}
                  loading={loading}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetailsPopup && selectedBooking && (
        <SeatBookingDetailsPopup
          selectedBooking={selectedBooking}
          bookingDetails={bookingDetails}
          loading={loading}
          onClose={() => setShowDetailsPopup(false)}
          onDeleteClick={() => {
            setShowDetailsPopup(false);
            setShowDeletePopup(true);
            
            // Pre-fill with first booking if available
            if (bookingDetails.length > 0) {
              const firstBooking = bookingDetails[0];
              setDeleteForm({
                bookingId: firstBooking.bookingId || '',
                seatId: firstBooking.seatId || '',
                date: firstBooking.date || '',
                entryTime: firstBooking.entryTime || '',
                exitTime: firstBooking.exitTime || ''
              });
            }
          }}
        />
      )}

      {showDeletePopup && (
        <DeleteSeatBookingPopup
          deleteForm={deleteForm}
          onInputChange={handleInputChange}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeletePopup(false)}
          loading={loading}
          error={error}
          bookingDetails={bookingDetails}
        />
      )}
    </div>
  );
}