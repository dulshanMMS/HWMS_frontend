import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminProfile from '../components/AdminProfile';
import useAuthGuard from '../components/AuthGuard';
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
import EventCalendar from '../components/EventCalendar';

const PROGRAM_TO_TEAM = {
  SENG: 'Team A',
  BM: 'Team B',
  IT: 'Team C',
  TEAM4: 'Team D',
  TEAM5: 'Team E',
  TEAM6: 'Team F',
  TEAM7: 'Team G',
  TEAM8: 'Team H',
  TEAM9: 'Team I',
  TEAM10: 'Team J',
  TEAM11: 'Team K',
  TEAM12: 'Team L',
  TEAM13: 'Team M',
  TEAM14: 'Team N',
  TEAM15: 'Team O',
};

const teamColors = {
  "Team A": "#60a5fa",      // blue-400
  "Team B": "#a78bfa",      // purple-400
  "Team C": "#fb923c",      // orange-400
  "Team D": "#fde68a",      // yellow-200
  "Team E": "#4ade80",      // green-400
  "Team F": "#f472b6",      // pink-400
  "Team G": "#818cf8",      // indigo-300
  "Team H": "#f87171",      // red-400
  "Team I": "#2dd4bf",      // teal-400
  "Team J": "#bef264",      // lime-400
  "Team K": "#a16207",      // yellow-700
  "Team L": "#a8a29e",      // stone-400
  "Team M": "#dc2626",      // red-600
  "Team N": "#fbbf24",      // amber-400
  "Team O": "#7c3aed",      // violet-600
};

const AdminViewReports = () => {
  useAuthGuard('admin');

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
    const color = teamColors[program] || '#9E9E9E';
    return (
      <div className="h-10 w-10 flex-shrink-0">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
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
                  <td>{user.name || user.id}</td>
                  <td>{PROGRAM_TO_TEAM[user.team] || user.team || user.team}</td>
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
                    <Bar dataKey="seats" fill="#00BCD4" name="Seats" />
                    <Bar dataKey="parking" fill="#9C27B0" name="Parking" />
                    <Bar dataKey="total" fill="#4CAF50" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Booking Stats</h2>
            <div className="h-[300px] overflow-x-auto">
              <div className="min-w-full" style={{ minWidth: `${Math.max(600, transformMonthlyStats().length * 40)}px` }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transformMonthlyStats()}>
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
                    <Line type="monotone" dataKey="seats" stroke="#00BCD4" name="Seats" />
                    <Line type="monotone" dataKey="parking" stroke="#9C27B0" name="Parking" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Program Bookings */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Program Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  {Object.keys(teamColors).map(team => (
                    <th key={team} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{team}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transformProgramBookings(analyticsData).map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.month}</td>
                    {Object.keys(teamColors).map(team => (
                      <td key={team} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row[team] || 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desk Usage */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Desk Usage</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unused</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transformDeskUsage().map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.floor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.used}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.unused}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Search</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter user ID or username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="userId">User ID</option>
                <option value="username">Username</option>
                <option value="team">Team</option>
              </select>
              <button
                onClick={fetchUserBookings}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </div>
          {renderUserBookings()}
          {renderTeamTable()}
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
