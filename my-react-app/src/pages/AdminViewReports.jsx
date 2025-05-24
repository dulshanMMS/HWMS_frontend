import axios from 'axios';
import { saveAs } from 'file-saver';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendar } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/AdminLayout';
import useAuthGuard from '../components/AuthGuard';
import BookingLookup from '../components/Reports/BookingLookup';
import DailyTrendsChart from '../components/Reports/DailyTrendsChart';
import FloorUsageChart from '../components/Reports/FloorUsageChart';
import MonthlyStatsChart from '../components/Reports/MonthlyStatsChart';
import RecentBookingsTable from '../components/Reports/RecentBookingsTable';
import UserBookingTable from '../components/Reports/UserBookingTable';
import TeamColorPalette from '../components/TeamColorPalette';
import api from '../config/api';

const AdminViewReports = () => {
  useAuthGuard('admin');//Authentication And State Initialization
  //state variables
  //Analytics & Loading States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //Date Range Filter
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showClearButton, setShowClearButton] = useState(false);
  // Booking lookup state
  const [searchType, setSearchType] = useState('username');
  const [searchQuery, setSearchQuery] = useState('');
  const [userError, setUserError] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]);// Stores all fetched bookings used for generating certain report charts 

  const totalDesksPerFloor = { 14: 64, 30: 64, 31: 64, 32: 64 };//Represents the total desks available per given floor

  useEffect(() => { 
    fetchAnalyticsData();
    fetchAllBookings();
  }, [appliedDateRange]);//Runs when the component mounts or when a new date range is applied

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setAppliedDateRange([startDate, endDate]);
      setShowClearButton(true);
    }//Applies the selected date range.
  };

  const handleClearDateRange = () => {
    setDateRange([null, null]);
    setAppliedDateRange([null, null]);
    setShowClearButton(false);
  };//Clears the date range selection.


  const fetchAnalyticsData = async () => {  //Fetch Analytics Data for the given date range
    try {
      setLoading(true); //loading indicator
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

//Fetch User Bookings (Lookup)
  const fetchUserBookings = async () => {
    if (!searchQuery.trim()) {
      setUserError('Please enter a search term');
      return;
    }
    try {
      setUserLoading(true);
      setUserError(null);
      setUserBookings(null);
      
      //logs for debugging
      console.log('Sending request with searchQuery:', searchQuery.trim(), 'and searchType:', searchType);

      // Determine the parameter to send based on searchType
      const params = { username: searchQuery.trim() };

      console.log('Request URL:', `http://localhost:5000/api/reports/user-lookup?username=${searchQuery.trim()}`);

      const response = await axios.get('http://localhost:5000/api/reports/user-lookup', {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      console.log('Response data:', response.data);
      setUserBookings(response.data);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setUserError(`Error: Failed to fetch bookings: ${err.message}`);
    } finally {
      setUserLoading(false);
    }
  };

  //Fetch All Bookings
  const fetchAllBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/all-bookings');
      setAllBookings(response.data);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
    }
  };
  

  const getFloorUsageBookings = () => {
    
    if (!appliedDateRange[0] || !appliedDateRange[1]) {// Use all bookings if no date range is applied
      return allBookings;
    }
    // Filter bookings by date range
    const [start, end] = appliedDateRange;
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= start && bookingDate <= end;
    });
  };
  
  //Creates and downloads an Excel file with summary analytics data
  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Total Bookings', analyticsData?.overallStats?.totalBookings || 0],
      ['Parking Bookings', analyticsData?.overallStats?.totalParking || 0],
      ['Seat Bookings', analyticsData?.overallStats?.totalSeats || 0],
      //
      //
      //
      // Add more data as needed
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'AdminViewReports.xlsx');
  };
    
    //Loading & Error States
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
            <UserBookingTable bookings={userBookings} />
          )}
        </div>
        <RecentBookingsTable bookings={allBookings} />
        

      
        <button
          onClick={downloadExcel}
          className="fixed bottom-5 right-5 px-5 py-2 bg-green-500 text-white rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50"
        >
          Download Excel
        </button>
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
