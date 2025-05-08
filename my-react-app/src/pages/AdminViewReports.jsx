import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import useAuthGuard from '../components/AuthGuard';
import api from '../config/api';
import { FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import DailyTrendsChart from '../components/DailyTrendsChart';
import MonthlyStatsChart from '../components/MonthlyStatsChart';
import DeskUsageTable from '../components/DeskUsageTable';
import BookingLookup from '../components/BookingLookup';
import teamColors from '../constants/teamColors';
import UserBookingsTable from '../components/UserBookingsTable';
import FloorUsageChart from '../components/FloorUsageChart';
import TeamColorPalette from '../components/TeamColorPalette';

const AdminViewReports = () => {
  useAuthGuard('admin');

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showClearButton, setShowClearButton] = useState(false);
  // Booking lookup state
  const [searchType, setSearchType] = useState('userId');
  const [searchQuery, setSearchQuery] = useState('');
  const [userError, setUserError] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]);

  const totalDesksPerFloor = { 14: 64, 30: 64, 31: 64, 32: 64 };

  useEffect(() => {
    fetchAnalyticsData();
    fetchAllBookings();
  }, [appliedDateRange]);

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setAppliedDateRange([startDate, endDate]);
      setShowClearButton(true);
    }
  };

  const handleClearDateRange = () => {
    setDateRange([null, null]);
    setAppliedDateRange([null, null]);
    setShowClearButton(false);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [appliedStart, appliedEnd] = appliedDateRange;
      
      const response = await api.get('/api/reports/analytics', {
        params: {
          startDate: appliedStart?.toISOString(),
          endDate: appliedEnd?.toISOString()
        }
      });
      
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    if (!searchQuery.trim()) {
      setUserError('Please enter a search term');
      return;
    }
    try {
      setUserLoading(true);
      setUserError(null);
      setUserBookings(null);
      // Replace with your actual API call logic
      // Example:
      // const response = await api.get(`/api/reports/user-lookup`, { params: { ... } });
      // setUserBookings(response.data);
      // Simulate error for demonstration:
      setTimeout(() => {
        setUserError('Error: Failed to fetch bookings: Server error');
        setUserLoading(false);
      }, 1000);
    } catch (err) {
      setUserError(`Error: Failed to fetch bookings: ${err.message}`);
      setUserLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await api.get('/api/reports/all-bookings');
      setAllBookings(response.data);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
    }
  };

  const getFloorUsageBookings = () => {
    // Use all bookings if no date range is applied
    if (!appliedDateRange[0] || !appliedDateRange[1]) {
      return allBookings;
    }
    // Filter bookings by date range
    const [start, end] = appliedDateRange;
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= start && bookingDate <= end;
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        {/* Header with Date Range Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Analytics & Reports</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setDateRange([date, endDate])}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Start date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setDateRange([startDate, date])}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="End date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            {!showClearButton ? (
              <button
                onClick={handleApplyDateRange}
                disabled={!startDate || !endDate}
                className={`px-4 py-2 rounded-md text-white ${
                  !startDate || !endDate 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              >
                Apply Date Range
              </button>
            ) : (
              <button
                onClick={handleClearDateRange}
                className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear Date Range
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {analyticsData?.overallStats?.totalBookings || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Parking Bookings</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#9C27B0' }}>
              {analyticsData?.overallStats?.totalParking || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800">Seat Bookings</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: '#00BCD4' }}>
              {analyticsData?.overallStats?.totalSeats || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DailyTrendsChart data={analyticsData} />
          <MonthlyStatsChart data={analyticsData} dateRange={appliedDateRange} />
        </div>
        
        {/* Tables Section */}
        <div className="flex flex-col md:flex-row items-start">
          <div className="flex-1 h-[340px] mr-6">
            <FloorUsageChart
              bookings={getFloorUsageBookings()}
              totalDesksPerFloor={totalDesksPerFloor}
            />
          </div>
          <div className="self-start">
            <TeamColorPalette />
          </div>
        </div>
        <div className="mt-10">
          <BookingLookup
            searchType={searchType}
            setSearchType={setSearchType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={fetchUserBookings}
            error={userError}
          />
          {userBookings && userBookings.length > 0 && (
            <UserBookingsTable bookings={userBookings} />
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminViewReports;
