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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AdminViewReports = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    console.log('Fetching analytics data...');
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Making API request to /reports/analytics');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const response = await api.get('/reports/analytics', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });
      
      console.log('API Response:', response.data);
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error('Detailed error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError(`Failed to fetch analytics data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for the daily trends chart
  const transformDailyTrends = () => {
    if (!analyticsData?.dailyTrends) return [];
    return analyticsData.dailyTrends.map(item => ({
      date: item._id.date,
      type: item._id.type,
      bookings: item.count,
      confirmed: item.confirmed,
      cancelled: item.cancelled
    }));
  };

  // Transform data for the status distribution pie chart
  const transformStatusDistribution = () => {
    if (!analyticsData?.statusDistribution) return [];
    return analyticsData.statusDistribution.map(item => ({
      name: item._id,
      value: item.count,
      parking: item.parkingCount,
      seats: item.seatsCount
    }));
  };

  // Transform data for peak hours chart
  const transformPeakHours = () => {
    if (!analyticsData?.peakHours) return [];
    return analyticsData.peakHours.map(item => ({
      hour: item._id.hour,
      type: item._id.type,
      bookings: item.count
    }));
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">Analytics & Reports</h1>
            <div className="flex items-center gap-2">
              <FaCalendar className="text-gray-500" />
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Select date range"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Daily Trends */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Daily Booking Trends</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transformDailyTrends()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="confirmed" stroke="#0088FE" name="Confirmed" />
                    <Line type="monotone" dataKey="cancelled" stroke="#FF8042" name="Cancelled" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Booking Status Distribution</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transformStatusDistribution()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {transformStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Peak Hours Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformPeakHours()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#0088FE" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <AdminProfile />
          </div>
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewReports; 