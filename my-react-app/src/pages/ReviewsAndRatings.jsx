import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { FaStar, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AdminSidebar from '../components/AdminSidebar';
import useAuthGuard from '../components/AuthGuard';
import api from '../config/api';
import { saveAs } from 'file-saver';

const ReviewsAndRatings = () => {
  useAuthGuard('admin');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [dateRange, setDateRange] = useState([null, null]);
  const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showClearButton, setShowClearButton] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const feedbacksPerPage = 10;

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const [appliedStart, appliedEnd] = appliedDateRange;
      const params = {};
      if (appliedStart && appliedEnd) {
        params.startDate = appliedStart.toISOString();
        params.endDate = appliedEnd.toISOString();
      }
      if (ratingFilter) params.rating = ratingFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/api/ratings/feedback', { params });
      setFeedbacks(response.data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (error) {
      console.error('Error fetching feedback:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setError(`Failed to fetch feedback: ${error.response?.status === 404 ? 'API endpoint not found' : error.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [appliedDateRange, ratingFilter, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeedback();
  };

  const getTimeSinceRefresh = () => {
    const now = new Date();
    const diffMs = now - lastRefreshed;
    const diffMins = Math.round(diffMs / 60000);
    return diffMins === 0 ? 'just now' : `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  };

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

  const handleReplySubmit = async () => {
    try {
      await api.put(`/api/ratings/feedback/${selectedFeedbackId}/reply`, { adminReply });
      setIsReplyModalOpen(false);
      setAdminReply('');
      setSelectedFeedbackId(null);
      await fetchFeedback();
    } catch (error) {
      console.error('Error adding reply:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Failed to add reply: ${error.message}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      const [appliedStart, appliedEnd] = appliedDateRange;
      const params = {};
      if (appliedStart && appliedEnd) {
        params.startDate = appliedStart.toISOString();
        params.endDate = appliedEnd.toISOString();
      }
      if (ratingFilter) params.rating = ratingFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/api/ratings/feedback/export', { params });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error('Error exporting feedback:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Failed to export feedback: ${error.message}`);
    }
  };

  // Calculate statistics
  const totalFeedback = feedbacks.length;
  const averageRating = feedbacks.length
    ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
    : 0;
  const statusCounts = feedbacks.reduce(
    (acc, fb) => {
      acc[fb.status] = (acc[fb.status] || 0) + 1;
      return acc;
    },
    { New: 0, Responded: 0 }
  );

  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);
  const paginatedFeedbacks = feedbacks.slice(
    (currentPage - 1) * feedbacksPerPage,
    currentPage * feedbacksPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-6 ml-8">Reviews & Ratings</h1>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-6 ml-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Reviews & Ratings
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last refreshed: {getTimeSinceRefresh()}</span>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform transform hover:scale-110"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-md" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow">
            <span className="text-2xl font-bold text-indigo-600">{totalFeedback}</span>
            <span className="text-sm text-gray-600">Total Feedback</span>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow">
            <span className="text-2xl font-bold text-yellow-500 flex items-center">
              {averageRating} <FaStar className="ml-1" />
            </span>
            <span className="text-sm text-gray-600">Average Rating</span>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow">
            <span className="text-2xl font-bold text-green-600">{statusCounts.Responded}</span>
            <span className="text-sm text-gray-600">Responded Feedback</span>
          </div>
        </div>

        {/* Date Picker Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-600" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setDateRange([date, endDate])}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white shadow-sm"
                placeholderText="Start date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-600" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setDateRange([startDate, date])}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white shadow-sm"
                placeholderText="End date"
                dateFormat="MMM dd, yyyy"
                disabled={showClearButton}
              />
            </div>
            {!showClearButton ? (
              <button
                onClick={handleApplyDateRange}
                disabled={!startDate || !endDate}
                className={`px-3 py-1 rounded-md text-sm font-medium text-white shadow-md transition-transform transform hover:scale-105 ${
                  !startDate || !endDate
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
              >
                Apply
              </button>
            ) : (
              <button
                onClick={handleClearDateRange}
                className="px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="border rounded-md p-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Ratings</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md p-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Responded">Responded</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          {paginatedFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No feedback found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Booking Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Admin Reply
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedFeedbacks.map((feedback, index) => (
                      <tr key={feedback._id || `feedback-${index}`} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {feedback.userId?.fullName || feedback.userId?.username || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              feedback.bookingType === 'seating'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {feedback.bookingType === 'seating' ? 'Seating' : 'Parking'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <FaStar key={i} className="inline text-yellow-400" />
                          ))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {feedback.feedback?.length > 50
                            ? `${feedback.feedback.substring(0, 50)}...`
                            : feedback.feedback || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {feedback.adminReply?.length > 50
                            ? `${feedback.adminReply.substring(0, 50)}...`
                            : feedback.adminReply || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {feedback.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setSelectedFeedbackId(feedback._id);
                              setAdminReply(feedback.adminReply || '');
                              setIsReplyModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            {feedback.adminReply ? 'Replied' : 'Reply'}
                          </button>
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
                  className={`px-4 py-2 rounded-md text-white shadow-md transition-transform transform hover:scale-105 ${
                    currentPage === 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                >
                  &lt; Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md text-white shadow-md transition-transform transform hover:scale-105 ${
                    currentPage === totalPages
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                >
                  Next &gt;
                </button>
              </div>
            </>
          )}
        </div>

        {isReplyModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reply to Feedback</h3>
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                className="w-full border rounded-md p-2 mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows="4"
                placeholder="Enter your reply..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!adminReply.trim()}
                >
                  Submit Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default ReviewsAndRatings;