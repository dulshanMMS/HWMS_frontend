import React, { useState, useEffect } from 'react';
import SeatBookingStats from './SeatBookingStats';
import SeatBookingDatesList from './SeatBookingDatesList';
import SeatBookingDetailsPopup from './SeatBookingDetailsPopup';
import DeleteSeatBookingPopup from './DeleteSeatBookingPopup';
import ErrorMessage from './ErrorMessage';

const SeatBookingHistory = () => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingDates, setBookingDates] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteForm, setDeleteForm] = useState({
    bookingId: '',
    seatId: '',
    date: '',
    entryTime: '',
    exitTime: ''
  });

  // Fetch booking history and team info on component mount
  useEffect(() => {
    fetchBookingHistory();
    fetchTeamInfo();
  }, []);

  const fetchTeamInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/seathistory/user/team', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamInfo(data);
      }
    } catch (error) {
      console.error('Error fetching team info:', error);
      // Don't show error for team info as it's optional
    }
  };

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/seathistory/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'seat' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking history');
      }

      const data = await response.json();
      setTotalBookings(data.totalBookings);
      setBookingDates(data.bookedDates);
      
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setError('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (dateObj) => {
    setSelectedBooking(dateObj);
    setDetailsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/seathistory/user/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          type: 'seat', 
          date: dateObj.date 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      setBookingDetails(data);
      
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details');
      setBookingDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (bookingDetails.length > 0) {
      if (bookingDetails.length === 1) {
        // Single booking - pre-fill the form
        const booking = bookingDetails[0];
        setDeleteForm({
          bookingId: booking.bookingId,
          seatId: booking.seatId,
          date: booking.date,
          entryTime: booking.entryTime,
          exitTime: booking.exitTime
        });
      } else {
        // Multiple bookings - reset form for selection
        setDeleteForm({
          bookingId: '',
          seatId: '',
          date: '',
          entryTime: '',
          exitTime: ''
        });
      }
      setShowDeletePopup(true);
    }
  };

  const handleDeleteFormChange = (e) => {
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

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/seathistory/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deleteForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete booking');
      }

      // Refresh the booking history
      await fetchBookingHistory();
      
      // Close popups and reset
      setShowDeletePopup(false);
      setSelectedBooking(null);
      setBookingDetails([]);
      setDeleteForm({
        bookingId: '',
        seatId: '',
        date: '',
        entryTime: '',
        exitTime: ''
      });
      setError('');
      
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeletePopup(false);
    setDeleteForm({
      bookingId: '',
      seatId: '',
      date: '',
      entryTime: '',
      exitTime: ''
    });
    setError('');
  };

  const handleCloseDetailsPopup = () => {
    setSelectedBooking(null);
    setBookingDetails([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Seat Booking History</h1>
        
        {error && <ErrorMessage message={error} />}
        
        <SeatBookingStats 
          totalBookings={totalBookings} 
          teamInfo={teamInfo}
          loading={loading} 
        />
        
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-600 mb-4">Your Seat Booking Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SeatBookingDatesList 
              bookingDates={bookingDates}
              loading={loading}
              onDateClick={handleDateClick}
            />
          </div>
        </div>

        <SeatBookingDetailsPopup 
          selectedBooking={selectedBooking}
          bookingDetails={bookingDetails}
          loading={detailsLoading}
          onClose={handleCloseDetailsPopup}
          onDeleteClick={handleDeleteClick}
        />

        {showDeletePopup && (
          <DeleteSeatBookingPopup 
            deleteForm={deleteForm}
            onInputChange={handleDeleteFormChange}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            loading={deleteLoading}
            error={error}
            bookingDetails={bookingDetails}
          />
        )}
      </div>
    </div>
  );
};

export default SeatBookingHistory;