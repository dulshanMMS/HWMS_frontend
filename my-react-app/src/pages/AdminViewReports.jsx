import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminProfile from '../components/AdminProfile';
import api from '../config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FaCalendar, FaSearch, FaUser } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PROGRAM_COLORS } from '../constants/colors';
import EventCalendar from '../components/EventCalendar';

const AdminViewReports = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [userId, setUserId] = useState('');
  const [userBookings, setUserBookings] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
    fetchBookings();
  }, [appliedDateRange]);

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      setAppliedDateRange([startDate, endDate]);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [appliedStart, appliedEnd] = appliedDateRange;
      
      console.log('Fetching analytics data...', {
        token: !!token,
        startDate: appliedStart?.toISOString(),
        endDate: appliedEnd?.toISOString()
      });
      
      const response = await api.get('/api/reports/analytics', {
        params: {
          startDate: appliedStart?.toISOString(),
          endDate: appliedEnd?.toISOString()
        }
      });
      
      console.log('Received analytics data:', response.data);
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    if (!userId.trim()) {
      setUserError('Please enter a user ID');
      return;
    }

    try {
      setUserLoading(true);
      setUserError(null);
      const response = await api.get(`/api/reports/user-bookings/${userId}`);
      setUserBookings(response.data);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setUserError(`Failed to fetch user bookings: ${err.response?.data?.message || err.message}`);
      setUserBookings(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch bookings...');
      const response = await api.get('/api/reports/recent');
      console.log('Response received:', response);
      setBookings(response.data);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setError('Failed to fetch recent bookings');
    } finally {
      setLoading(false);
    }
  };

  const transformDailyTrends = () => {
    if (!analyticsData?.dailyTrends) {
      console.log('No daily trends data available');
      return [];
    }
    const transformed = analyticsData.dailyTrends.map(item => {
      const date = item._id.date ? new Date(item._id.date) : new Date(); // Default to current date if invalid
      return {
        date: date.toLocaleDateString(), // Format the date correctly
        seats: item.seatsCount || 0,
        parking: item.parkingCount || 0,
        total: (item.seatsCount || 0) + (item.parkingCount || 0)
      };
    });
    console.log('Transformed daily trends:', transformed);
    return transformed;
  };

  const transformMonthlyStats = () => {
    if (!analyticsData?.monthlyStats) return [];
    return analyticsData.monthlyStats.map(item => {
      const month = item._id.month ? new Date(item._id.month) : new Date(); // Default to current month if invalid
      return {
        month: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        seats: item.seatsCount || 0,
        parking: item.parkingCount || 0,
        total: (item.seatsCount || 0) + (item.parkingCount || 0)
      };
    });
  };

  const transformProgramBookings = (analyticsData) => {
    if (!analyticsData?.programBookings?.length) return [];
    
    return analyticsData.programBookings.map(booking => ({
        ...booking,
        month: new Date(booking.month).toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short'
        })
    }));
  };

  const transformDeskUsage = () => {
    if (!analyticsData?.deskUsage) return [];
    return analyticsData.deskUsage.map(item => ({
      floor: item.floor,
      used: item.used,
      unused: item.unused
    }));
  };

  const renderUserBookings = () => {
    if (userLoading) return <div className="text-center">Loading user bookings...</div>;
    if (userError) return <div className="text-red-500">{userError}</div>;
    if (!userBookings) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Booking History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userBookings.map((booking, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAvatar = (userId, program) => {
    const backgroundColor = PROGRAM_COLORS[program] || '#9E9E9E';
    
    return (
      <div className="h-10 w-10 flex-shrink-0">
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor }}
        >
          <FaUser className="h-5 w-5" />
        </div>
      </div>
    );
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
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
                />
              </div>
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
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">Total Bookings</h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {analyticsData?.overallStats?.totalBookings || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700">Parking Bookings</h3>
              <p className="text-3xl font-bold text-green-800 mt-2">
                {analyticsData?.overallStats?.totalParking || 0}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-700">Seat Bookings</h3>
              <p className="text-3xl font-bold text-yellow-800 mt-2">
                {analyticsData?.overallStats?.totalSeats || 0}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Daily Trends */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Daily Booking Trends</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformDailyTrends()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="seats" fill={PROGRAM_COLORS.SENG} name="Seats" />
                    <Bar dataKey="parking" fill={PROGRAM_COLORS.BM} name="Parking" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Monthly Statistics</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transformMonthlyStats()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="seats" 
                      stroke={PROGRAM_COLORS.SENG} 
                      name="Seats" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="parking" 
                      stroke={PROGRAM_COLORS.BM} 
                      name="Parking" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#FF0000"
                      name="Total"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Desk Usage Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Desk Usage by Floor</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transformDeskUsage()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="%" domain={[0, 100]} />
                    <YAxis dataKey="floor" type="category" />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="used" fill="#8884d8" name="Used" stackId="a" />
                    <Bar dataKey="unused" fill="#d3d3d3" name="Unused" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Desk Bookings By Program */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Monthly Desk Bookings By Program</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformProgramBookings(analyticsData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="SENG" 
                      stackId="a" 
                      fill={PROGRAM_COLORS.SENG} 
                      name="Software Engineering" 
                    />
                    <Bar 
                      dataKey="BM" 
                      stackId="a" 
                      fill={PROGRAM_COLORS.BM} 
                      name="Business Management" 
                    />
                    <Bar 
                      dataKey="IT" 
                      stackId="a" 
                      fill={PROGRAM_COLORS.IT} 
                      name="Information Technology" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Recent Bookings Table */}
          <div className="bg-white rounded-lg shadow-lg mt-6 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking, index) => (
                      <tr key={booking._id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderAvatar(booking.userId, booking.program)}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.userId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.program}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: PROGRAM_COLORS[booking.program] }}
                            ></div>
                            <span className="text-sm text-gray-900">{booking.program}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${booking.bookingType === 'seat' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'}`}>
                            {booking.bookingType === 'seat' ? 'Seat Booking' : 'Parking Booking'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Booking Lookup Section */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">User Booking Lookup</h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="flex-1 max-w-md border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={fetchUserBookings}
                disabled={userLoading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                <FaSearch className="inline mr-2" />
                Search
              </button>
            </div>
            {renderUserBookings()}
          </div>
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
