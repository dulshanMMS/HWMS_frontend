import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminProfile from '../components/AdminProfile';
import useAuthGuard from '../components/AuthGuard';
import { FaFilter, FaSearch, FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import avatar from '../assets/profile_photo.jpg';

const API_BASE_URL = 'http://localhost:5000/api/notifications';

const AdminNotification = () => {
  useAuthGuard('admin');
  
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchNotifications = async () => {
    console.log('Attempting to fetch notifications');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        return;
      }

      let endpoint = `${API_BASE_URL}?`;
      if (filter !== 'all') {
        endpoint += `&status=${filter}`;
      }
      if (startDate && endDate) {
        endpoint += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      console.log('Fetching from endpoint:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Unauthorized access - redirecting to login');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Fetched notifications:', data);
      if (Array.isArray(data)) {
      setNotifications(data);
      } else {
        setNotifications([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchNotifications();
  }, [filter, dateRange]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(notifications.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calendar logic (copied from AdminDashboard)
  const formatDateToYMD = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const fetchAllEvents = async () => {
    try {
      const res = await fetch(`/api/events`);
      const data = await res.json();
      if (data.success) {
        setAllEvents(data.events);
        const dates = data.events.map(event => event.date);
        setEventDates(dates);
      }
    } catch (err) {
      console.error('Error fetching all events:', err);
    }
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = formatDateToYMD(selectedDate);
      const res = await fetch(`/api/events/${formattedDate}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchEventsForDate(value);
    setShowEventModal(true);
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <AdminProfile />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FaFilter />
                      <span>Filters</span>
                    </button>
                  </div>

                  {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="flex flex-wrap gap-4 mb-4">
                        <button 
                          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                            filter === 'all' 
                              ? 'bg-primary text-white' 
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          onClick={() => setFilter('all')}
                        >
                          All
                        </button>
                        <button 
                          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                            filter === 'unread' 
                              ? 'bg-primary text-white' 
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          onClick={() => setFilter('unread')}
                        >
                          Unread
                        </button>
                        <button 
                          className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                            filter === 'read' 
                              ? 'bg-primary text-white' 
                              : 'bg-white hover:bg-gray-100'
                          }`}
                          onClick={() => setFilter('read')}
                        >
                          Read
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-500" />
                        <DatePicker
                          selectsRange={true}
                          startDate={startDate}
                          endDate={endDate}
                          onChange={(update) => setDateRange(update)}
                          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholderText="Select date range..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-gray-200">
                  {error && (
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                      {error}
                    </div>
                  )}
                  
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No notifications found
                    </div>
                  ) : (
                    filteredNotifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                          notification.read ? 'bg-white' : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            <p className="mt-1 text-gray-600">{notification.message}</p>
                            <span className="mt-2 text-sm text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="px-3 py-1 text-sm text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition-colors duration-200"
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white border border-red-600 rounded-md transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold mb-2">Event Calendar</h2>
            <Calendar
              onClickDay={handleDayClick}
              value={date}
              tileClassName={({ date: tileDate }) => {
                const today = new Date();
                const isToday =
                  tileDate.getDate() === today.getDate() &&
                  tileDate.getMonth() === today.getMonth() &&
                  tileDate.getFullYear() === today.getFullYear();
                const isEventDay = eventDates.includes(formatDateToYMD(tileDate));
                if (isToday) return 'bg-green-300 text-white rounded-full';
                if (isEventDay) return 'bg-yellow-200 font-semibold rounded-lg';
                return null;
              }}
            />
            {showEventModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
                  <h2 className="text-lg font-bold mb-2">Events on {date.toDateString()}</h2>
                  {events.length > 0 ? (
                    <ul className="text-sm list-disc ml-4 mb-4">
                      {events.map((ev, idx) => (
                        <li key={idx} className="flex justify-between items-start">
                          <div>
                            <strong>{ev.title}</strong> {ev.time && `at ${ev.time}`}
                            {ev.description && ` - ${ev.description}`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">No events yet.</p>
                  )}
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setShowEventModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
                  </div>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotification; 