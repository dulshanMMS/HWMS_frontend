import React, { useState, useEffect } from 'react';
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
  const [allBookingDates, setAllBookingDates] = useState([]); // Store all dates for filtering
  const [totalBookings, setTotalBookings] = useState(0);
  const [teamInfo, setTeamInfo] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Filter states
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'month', 'date'
  
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

  // Helper function to sort dates: today first, then future dates (ascending), then past dates (descending)
  const sortBookingDates = (dates) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return [...dates].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      
      const isAToday = dateA.getTime() === today.getTime();
      const isBToday = dateB.getTime() === today.getTime();
      const isAFuture = dateA > today;
      const isBFuture = dateB > today;
      const isAPast = dateA < today;
      const isBPast = dateB < today;
      
      // Today bookings come first
      if (isAToday && !isBToday) return -1; // A is today, B is not
      if (!isAToday && isBToday) return 1;  // B is today, A is not
      
      // Both are today (shouldn't happen but just in case)
      if (isAToday && isBToday) return 0;
      
      // Future dates come second (ascending order - nearest future first)
      if (isAFuture && isBFuture) {
        return dateA - dateB; // Earlier future dates first
      }
      
      // Past dates come last (descending order - most recent past first)
      if (isAPast && isBPast) {
        return dateB - dateA; // More recent past dates first
      }
      
      // Future vs past (future comes before past)
      if (isAFuture && isBPast) return -1; // Future before past
      if (isAPast && isBFuture) return 1;  // Future before past
      
      // Default fallback
      return dateA - dateB;
    });
  };

  // NEW: Filter functions
  const getAvailableMonths = () => {
    const months = new Set();
    allBookingDates.forEach(booking => {
      const date = new Date(booking.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort();
  };

  const filterBookingsByMonth = (monthYear) => {
    if (!monthYear) return allBookingDates;
    
    return allBookingDates.filter(booking => {
      const date = new Date(booking.date);
      const bookingMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return bookingMonthYear === monthYear;
    });
  };

  const filterBookingsByDate = (selectedDate) => {
    if (!selectedDate) return allBookingDates;
    
    return allBookingDates.filter(booking => booking.date === selectedDate);
  };

  const handleFilterChange = (type, value) => {
    setFilterType(type);
    
    if (type === 'all') {
      setSelectedMonth('');
      setSelectedDate('');
      setBookingDates(allBookingDates);
    } else if (type === 'month') {
      setSelectedMonth(value);
      setSelectedDate('');
      setBookingDates(filterBookingsByMonth(value));
    } else if (type === 'date') {
      setSelectedDate(value);
      setSelectedMonth('');
      setBookingDates(filterBookingsByDate(value));
    }
  };

  const clearFilters = () => {
    setFilterType('all');
    setSelectedMonth('');
    setSelectedDate('');
    setBookingDates(allBookingDates);
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
      
      // Sort the dates before setting state
      const sortedDates = sortBookingDates(formattedDates);
      
      setTotalBookings(totalBookings);
      setAllBookingDates(sortedDates); // Store all dates
      setBookingDates(sortedDates); // Initially show all dates
      
      console.log('📅 Booking dates sorted:', sortedDates.map(d => d.date));
      
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
      
      // Sort booking details by time if multiple bookings on same date
      const sortedDetails = response.data.sort((a, b) => {
        const timeA = a.entryTime || '00:00';
        const timeB = b.entryTime || '00:00';
        return timeA.localeCompare(timeB);
      });
      
      setBookingDetails(sortedDetails);
      
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
              {/* Header with Title and Filter Section */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Your Seat Booking History</h1>
                  <p className="text-gray-600">Welcome back!</p>
                </div>
                
                {/* Filter Section */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-600">Filter:</label>
                    <select
                      value={filterType}
                      onChange={(e) => {
                        if (e.target.value === 'all') {
                          handleFilterChange('all', '');
                        } else {
                          setFilterType(e.target.value);
                        }
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Dates</option>
                      <option value="month">By Month</option>
                      <option value="date">By Date</option>
                    </select>
                  </div>
                  
                  {/* Month Filter */}
                  {filterType === 'month' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Month:</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Month</option>
                        {getAvailableMonths().map(month => {
                          const [year, monthNum] = month.split('-');
                          const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                          return (
                            <option key={month} value={month}>
                              {monthName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  
                  {/* Date Filter */}
                  {filterType === 'date' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600">Date:</label>
                      <select
                        value={selectedDate}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Date</option>
                        {allBookingDates.map(booking => (
                          <option key={booking.id} value={booking.date}>
                            {booking.date}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Clear Filters Button */}
                  {(selectedMonth || selectedDate || filterType !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      Clear Filters
                    </button>
                  )}
                  
                  {/* Results Count */}
                  <div className="text-xs text-gray-500">
                    Showing {bookingDates.length} of {allBookingDates.length} dates
                  </div>
                </div>
              </div>

              <div className="flex border-b mb-6">
                <div className="py-2 px-4">About your Seat Bookings</div>
              </div>

              {error && <ErrorMessage message={error} />}

              <SeatBookingStats 
                totalBookings={totalBookings} 
                teamInfo={teamInfo}
                loading={loading} 
              />

              <div className="mb-4">
                <h2 className="text-sm font-medium text-gray-600 mb-2">
                  Your Booking Dates
                  {filterType === 'month' && selectedMonth && (
                    <span className="text-green-600 ml-2">
                      - {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  {filterType === 'date' && selectedDate && (
                    <span className="text-green-600 ml-2">- {selectedDate}</span>
                  )}
                </h2>
              </div>

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