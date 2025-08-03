import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';

const RecentBookingsTable = ({ bookings, refreshTrigger }) => {
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  // Auto-refresh bookings every 5 minutes and on refreshTrigger change
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true);
        const response = await axios.get('/api/reports/recent');
        setLastRefreshed(new Date());
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings(); // Initial fetch
    const interval = setInterval(fetchBookings, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [refreshTrigger]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get('/api/reports/recent');
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate time since last refresh
  const getTimeSinceRefresh = () => {
    const now = new Date();
    const diffMs = now - lastRefreshed;
    const diffMins = Math.round(diffMs / 60000);
    return diffMins === 0 ? 'just now' : `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  };

  // Function to get username from booking data
  const getUsername = (booking) => {
    if (booking.user?.fullName) return booking.user.fullName;
    if (booking.user?.name) return booking.user.name;
    if (booking.user?.username) return booking.user.username;
    if (booking.userName) return booking.userName;
    if (booking.booking?.userName) return booking.booking.userName;
    return 'Unknown User';
  };

  // Function to get team name from booking data
  const getTeamName = (booking) => {
    if (booking.team && booking.team !== 'No Team') return booking.team;
    if (booking.booking?.team && booking.booking.team !== 'No Team') return booking.booking.team;
    if (booking.user?.team && booking.user.team !== 'No Team') return booking.user.team;
    if (booking.booking?.user?.team && booking.booking.user.team !== 'No Team') return booking.booking.user.team;
    return 'No Team';
  };

  // Function to get booking type
  const getBookingType = (booking) => {
    if (booking.type) return booking.type;
    if (booking.slotType) return booking.slotType === 'seating' ? 'seat' : booking.slotType;
    return 'unknown';
  };

  // Function to get booking date and time
  const getBookingDateTime = (booking) => {
    const date = booking.date || booking.booking?.date;
    const entryTime = booking.entryTime || booking.booking?.entryTime;
    if (!date || isNaN(new Date(date))) {
      console.warn('Invalid or missing date in booking:', date);
      return new Date();
    }
    const [hours, minutes] = entryTime ? entryTime.split(':').map(Number) : [0, 0];
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  };

  // Function to get slot info
  const getSlotInfo = (booking) => {
    const slotNumber = booking.slot?.slotNumber || booking.slotNumber;
    const floor = booking.slot?.floor || booking.floor;
    return slotNumber && floor ? `${slotNumber} (Floor ${floor})` : 'N/A';
  };

  // Function to get time info
  const getTimeInfo = (booking) => {
    const entryTime = booking.entryTime || booking.booking?.entryTime;
    const exitTime = booking.exitTime || booking.booking?.exitTime;
    return entryTime && exitTime ? `${entryTime} - ${exitTime}` : 'N/A';
  };

  // Filter bookings to include only today and future, then sort and paginate
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const futureBookings = bookings
    .filter(booking => {
      const bookingDateTime = getBookingDateTime(booking);
      return bookingDateTime >= today;
    })
    .sort((a, b) => getBookingDateTime(a) - getBookingDateTime(b));

  const totalPages = Math.ceil(futureBookings.length / bookingsPerPage);
  const paginatedBookings = futureBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  // Handle pagination navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  console.log('Paginated Bookings Data:', {
    allBookingsCount: bookings.length,
    filteredBookingsCount: futureBookings.length,
    currentPage,
    totalPages,
    sampleBooking: paginatedBookings[0] ? {
      id: paginatedBookings[0]._id,
      date: getBookingDateTime(paginatedBookings[0]),
      createdAt: paginatedBookings[0].createdAt,
      type: getBookingType(paginatedBookings[0]),
      user: getUsername(paginatedBookings[0]),
      team: getTeamName(paginatedBookings[0]),
      slot: getSlotInfo(paginatedBookings[0]),
      time: getTimeInfo(paginatedBookings[0])
    } : null
  });

  if (bookingsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-4 mb-6 relative">
        <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Last refreshed: {getTimeSinceRefresh()}</span>
          <button
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 mb-6 relative">
      <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-sm text-gray-500">Last refreshed: {getTimeSinceRefresh()}</span>
        <button
          onClick={handleRefresh}
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-5 w-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          </button>
      </div>
      {paginatedBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No upcoming bookings found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TEAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLOT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TIME
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings.map((booking, index) => (
                  <tr key={booking._id || booking.id || `booking-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getUsername(booking) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTeamName(booking) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getBookingType(booking) === 'seat' 
                          ? 'bg-cyan-100 text-cyan-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getBookingType(booking) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getBookingDateTime(booking)?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSlotInfo(booking)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTimeInfo(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-white ${
                currentPage === 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              &lt; Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-white ${
                currentPage === totalPages
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentBookingsTable;