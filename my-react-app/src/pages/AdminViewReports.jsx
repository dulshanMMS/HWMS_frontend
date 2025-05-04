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
  const [showClearButton, setShowClearButton] = useState(false);
  const [searchType, setSearchType] = useState('userId');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamResults, setTeamResults] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
    fetchBookings();
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
    if (!searchQuery.trim()) {
      setUserError('Please enter a search term');
      return;
    }

    try {
      setUserLoading(true);
      setUserError(null);
      setTeamResults(null);
      setUserBookings(null);

      if (searchType === 'team') {
        const response = await api.get(`/api/reports/team-lookup`, {
          params: { team: searchQuery.trim() }
        });
        setTeamResults(response.data);
      } else {
        // userId or username
        const response = await api.get(`/api/reports/user-lookup`, {
          params: searchType === 'userId'
            ? { userId: searchQuery.trim() }
            : { username: searchQuery.trim() }
        });
        setUserBookings(response.data);
      }
    } catch (err) {
      setUserError(`Failed to fetch bookings: ${err.response?.data?.error || err.message}`);
      setUserBookings(null);
      setTeamResults(null);
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
      const date = item._id.date ? new Date(item._id.date) : new Date();
      return {
        date: date.toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        seats: item.seatsCount || 0,
        parking: item.parkingCount || 0,
        total: (item.seatsCount || 0) + (item.parkingCount || 0)
      };
    });
    console.log('Transformed daily trends:', transformed);
    return transformed;
  };

  const transformMonthlyStats = () => {
    if (!analyticsData?.dailyTrends) return [];
    const [appliedStart, appliedEnd] = appliedDateRange;
    
    let startDate, endDate;
    if (!appliedStart || !appliedEnd) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate = new Date(appliedStart);
      endDate = new Date(appliedEnd);
    }

    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates.map(date => {
      const matchingData = analyticsData.dailyTrends.find(item => 
        new Date(item._id.date).toDateString() === date.toDateString()
      ) || { seatsCount: 0, parkingCount: 0 };

      return {
        date: date.toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        seats: matchingData.seatsCount || 0,
        parking: matchingData.parkingCount || 0
      };
    });
  };

  const transformProgramBookings = (analyticsData) => {
    if (!analyticsData?.programBookings?.length) return [];
    
    return analyticsData.programBookings.map(booking => {
      // Convert old program names to new team names
      const bookingData = {
        ...booking,
        month: new Date(booking.month).toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short'
        })
      };

      // Map old program names to new team names
      if (booking.SENG !== undefined) bookingData['Team A'] = booking.SENG;
      if (booking.BM !== undefined) bookingData['Team B'] = booking.BM;
      if (booking.IT !== undefined) bookingData['Team C'] = booking.IT;

      // Delete old program properties
      delete bookingData.SENG;
      delete bookingData.BM;
      delete bookingData.IT;

      return bookingData;
    });
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

  const renderTeamTable = () => {
    if (userLoading) return <div className="text-center">Loading team bookings...</div>;
    if (userError) return <div className="text-red-500">{userError}</div>;
    if (!teamResults) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3">Team Booking Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Team</th>
                <th>Parking Bookings</th>
                <th>Seat Bookings</th>
                <th>Booking Dates</th>
              </tr>
            </thead>
            <tbody>
              {teamResults.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.team}</td>
                  <td>{user.parkingCount}</td>
                  <td>{user.seatCount}</td>
                  <td>
                    {user.bookings.map((b, i) => (
                      <div key={i}>{b.type}: {new Date(b.date).toLocaleDateString()}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          {/* Daily Trends */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Booking Trends</h2>
            <div className="h-[300px] overflow-x-auto">
              <div className="min-w-full" style={{ minWidth: `${Math.max(600, transformDailyTrends().length * 40)}px` }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transformDailyTrends()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickMargin={15}
                    />
                    <YAxis tick={{ fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="seats" fill={PROGRAM_COLORS['Team A']} name="Seats" />
                    <Bar dataKey="parking" fill={PROGRAM_COLORS['Team B']} name="Parking" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Statistics</h2>
            <div className="h-[300px] overflow-x-auto">
              <div className="min-w-full" style={{ minWidth: `${Math.max(600, transformMonthlyStats().length * 40)}px` }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transformMonthlyStats()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickLine={{ stroke: '#6B7280' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickMargin={15}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280' }}
                      tickLine={{ stroke: '#6B7280' }}
                      axisLine={{ stroke: '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="seats" 
                      stroke="#00BCD4" 
                      name="Seats"
                      strokeWidth={2}
                      dot={{ fill: '#00BCD4', r: 4 }}
                      activeDot={{ r: 6, fill: '#00BCD4' }}
                      connectNulls
                    />
                    <Line 
                      type="monotone" 
                      dataKey="parking" 
                      stroke="#9C27B0" 
                      name="Parking"
                      strokeWidth={2}
                      dot={{ fill: '#9C27B0', r: 4 }}
                      activeDot={{ r: 6, fill: '#9C27B0' }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Desk Usage Statistics */}
          <div className="bg-white rounded-2xl shadow-sm p-6 col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Desk Usage by Floor</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformDeskUsage()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fill: '#6B7280' }} />
                  <YAxis dataKey="floor" type="category" tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(2)}%`}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="used" fill="#8884d8" name="Used" stackId="a" />
                  <Bar dataKey="unused" fill="#d3d3d3" name="Unused" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Desk Bookings By Program */}
          <div className="bg-white rounded-2xl shadow-sm p-6 col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Bookings Count</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformProgramBookings(analyticsData)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Team A" 
                    stackId="a" 
                    fill={PROGRAM_COLORS['Team A']} 
                    name="Team A" 
                  />
                  <Bar 
                    dataKey="Team B" 
                    stackId="a" 
                    fill={PROGRAM_COLORS['Team B']} 
                    name="Team B" 
                  />
                  <Bar 
                    dataKey="Team C" 
                    stackId="a" 
                    fill={PROGRAM_COLORS['Team C']} 
                    name="Team C" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              {/* User Booking Lookup Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaSearch className="text-primary text-xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Booking Lookup</h3>
                  </div>
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <select
                      value={searchType}
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        setSearchQuery('');
                        setUserBookings(null);
                        setUserError(null);
                      }}
                      className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700"
                    >
                      <option value="userId">Search by User ID</option>
                      <option value="team">Search by Team</option>
                    </select>
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'userId' ? "Enter User ID" : "Enter Team Name"}
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setUserBookings(null);
                            setUserError(null);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={fetchUserBookings}
                      disabled={userLoading}
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap font-medium"
                    >
                      {userLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </span>
                      ) : (
                        <>
                          <FaSearch className="inline mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {userError && (
                  <div className="mt-3 text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                    <span className="font-medium">Error:</span> {userError}
                  </div>
                )}
              </div>
              
              {/* Table Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {userBookings ? (
                    searchType === 'userId' 
                      ? `Bookings for User: ${searchQuery}`
                      : `Bookings for Team: ${searchQuery}`
                  ) : (
                    'Recent Bookings'
                  )}
                </h2>
                {userBookings && (
                  <button
                    onClick={() => {
                      setUserBookings(null);
                      setSearchQuery('');
                      setUserError(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <span>Clear Search</span>
                    <span className="text-xs">×</span>
                  </button>
                )}
              </div>
            </div>
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
                {userBookings ? (
                  userBookings.map((booking, index) => (
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
                          ${booking.type === 'seat' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'}`}>
                          {booking.type === 'seat' ? 'Seat Booking' : 'Parking Booking'}
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
                  bookings && bookings.length > 0 ? (
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
                  )
                )}
              </tbody>
            </table>
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
