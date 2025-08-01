import { useState, useEffect } from 'react';
import axios from 'axios';
import LeftSidebar from "../components/LeftSidebar";

import BookingStats from '../components/parkingHistory/BookingStats';
import BookingDatesList from '../components/parkingHistory/BookingDatesList';
import BookingDetailsPopup from '../components/parkingHistory/BookingDetailsPopup';
import DeleteBookingPopup from '../components/parkingHistory/DeleteBookingPopup';
import BookingSelectionPopup from '../components/parkingHistory/BookingSelectionPopup';
import ErrorMessage from '../components/parkingHistory/ErrorMessage';
import ViewToggle from '../components/parkingHistory/ViewToggle';

const API_BASE_URL = 'http://localhost:5000/api';
const BOOKINGS_PER_PAGE = 50; // Pagination constant

export default function BookingHistory() {
  
   // State managements
  const [allBookingDates, setAllBookingDates] = useState([]); // Store all bookings
  const [displayedBookingDates, setDisplayedBookingDates] = useState([]); // Store filtered bookings
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllBookings, setShowAllBookings] = useState(false); // Toggle state
  
  // NEW: Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
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

  // Function to filter dates to show only relevant bookings (future + last 30 days)
  const filterRelevantDates = (dates) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Calculate 30 days ago from today
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return dates.filter(dateItem => {
      const bookingDate = new Date(dateItem.date);
      bookingDate.setHours(0, 0, 0, 0);
      
      // Show if booking is:
      // 1. Future booking (including today)
      // 2. Past booking within last 30 days
      return bookingDate >= thirtyDaysAgo;
    });
  };

  // Function to sort dates in descending order (most recent first)
  const sortDatesByMostRecent = (dates) => {
    return dates.sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Sort in descending order (most recent first)
      return dateB - dateA;
    });
  };

  // NEW: Function to paginate bookings
  const paginateBookings = (bookings, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bookings.slice(startIndex, endIndex);
  };

  // NEW: Calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update displayed bookings when toggle changes or page changes
  useEffect(() => {
    if (showAllBookings) {
      // Apply pagination to all bookings
      const totalPagesCount = calculateTotalPages(allBookingDates.length, BOOKINGS_PER_PAGE);
      setTotalPages(totalPagesCount);
      
      const paginatedBookings = paginateBookings(allBookingDates, currentPage, BOOKINGS_PER_PAGE);
      setDisplayedBookingDates(paginatedBookings);
    } else {
      // Reset pagination when switching back to filtered view
      setCurrentPage(1);
      setTotalPages(1);
      
      const filteredDates = filterRelevantDates(allBookingDates);
      setDisplayedBookingDates(filteredDates);
    }
  }, [showAllBookings, allBookingDates, currentPage]);

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
      
      // Sort all dates by most recent first
      const sortedDates = sortDatesByMostRecent(formattedDates);
      
      setTotalBookings(totalBookings);
      setAllBookingDates(sortedDates); // Store all bookings
      // displayedBookingDates will be set by useEffect above
      
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

  // Toggle between showing all bookings and filtered bookings
  const handleToggleView = () => {
    setShowAllBookings(!showAllBookings);
    // Reset to first page when toggling view
    setCurrentPage(1);
  };

  // NEW: Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // NEW: Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      if (currentPage <= halfVisible + 1) {
        // Show first pages
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        // Show last pages
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show middle pages
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleDateClick = (date) => {
    setSelectedBooking(date);
    fetchBookingDetails(date.date);
    setShowDetailsPopup(true);
  };

  // UPDATED: Check if multiple bookings exist and show selection popup
  const handleDeleteClick = (booking) => {
    setShowDetailsPopup(false);
    
    // If there are multiple bookings, show selection popup
    if (bookingDetails.length > 1) {
      setShowSelectionPopup(true);
    } else {
      // If only one booking, proceed directly to delete popup
      proceedToDelete(bookingDetails[0]);
    }
  };

  // NEW: Handle booking selection from selection popup
  const handleBookingSelection = (selectedBookingData) => {
    setShowSelectionPopup(false);
    proceedToDelete(selectedBookingData);
  };

  // NEW: Proceed to delete popup with selected booking data
  const proceedToDelete = (bookingData) => {
    setShowDeletePopup(true);
    
    // Pre-fill delete form with selected booking details
    setDeleteForm({
      slotNumber: bookingData.slotNumber.toString(),
      date: bookingData.date,
      entryTime: bookingData.entryTime,
      exitTime: bookingData.exitTime
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
      <LeftSidebar />     

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

              {/* View Toggle Component */}
              <ViewToggle
                showAllBookings={showAllBookings}
                onToggle={handleToggleView}
                filteredCount={filterRelevantDates(allBookingDates).length}
                totalCount={allBookingDates.length}
              />

              {/* NEW: Pagination Info - Always show when viewing all bookings to demonstrate pagination implementation */}
              {showAllBookings && allBookingDates.length > 0 && (
                <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Showing {((currentPage - 1) * BOOKINGS_PER_PAGE) + 1} to {Math.min(currentPage * BOOKINGS_PER_PAGE, allBookingDates.length)} of {allBookingDates.length} total bookings (Page {currentPage} of {totalPages})
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BookingDatesList
                  bookingDates={displayedBookingDates}
                  loading={loading}
                  onDateClick={handleDateClick}
                />
              </div>

              {/* NEW: Pagination Controls - Always show when viewing all bookings to demonstrate pagination implementation */}
              {showAllBookings && allBookingDates.length > 0 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {getPageNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                        disabled={pageNum === '...'}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === currentPage
                            ? 'bg-green-600 text-white'
                            : pageNum === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>

                  {/* Jump to Page Input - Only show when there are multiple pages */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm text-gray-600">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Popup */}
      {showDetailsPopup && selectedBooking && (
        <BookingDetailsPopup
          selectedBooking={selectedBooking}
          bookingDetails={bookingDetails}
          loading={loading}
          onClose={() => setShowDetailsPopup(false)}
          onDeleteClick={() => handleDeleteClick()}
        />
      )}

      {/* NEW: Booking Selection Popup - Shows when multiple bookings exist */}
      {showSelectionPopup && selectedBooking && (
        <BookingSelectionPopup
          selectedBooking={selectedBooking}
          bookingDetails={bookingDetails}
          onSelectBooking={handleBookingSelection}
          onCancel={() => setShowSelectionPopup(false)}
          loading={loading}
        />
      )}

      {/* Delete Booking Popup */}
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