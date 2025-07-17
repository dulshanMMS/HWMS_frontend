
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AdminLayout from '../components/AdminLayout';
import useAuthGuard from '../components/AuthGuard';
import EventCalendar from '../components/AdminDashboard/EventCalendar';
import NotificationFilters from '../components/Notification/NotificationFilters';
import NotificationList from '../components/Notification/NotificationList';
import NotificationPreferences from "../components/Notification/NotificationPreferences";

const API_BASE_URL = '/api/notifications/admin/own';

const socket = io('/', { withCredentials: true });

const AdminNotification = () => {
  useAuthGuard('admin');

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [showClearButton, setShowClearButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;
  const [totalNotifications, setTotalNotifications] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug token

      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        return;
      }

      const endpoint = `${API_BASE_URL}?page=${currentPage}&limit=${notificationsPerPage}`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        console.error('Authentication error:', response.status);
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notifications: ${errorText}`);
      }

      const data = await response.json();
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setTotalNotifications(data.total);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error.message);
      setError(`Failed to fetch notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, dateRange, currentPage]);

  useEffect(() => {
    socket.on('notificationReceived', (notification) => {
      console.log("New notification:", notification);
      setNotifications(prev => [notification, ...prev]);
    });
    return () => socket.off('notificationReceived');
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Mark as read token:', token); // Debug token
      const response = await fetch(`/api/notifications/${id}/mark-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      setError('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Delete notification token:', token); // Debug token
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'announcements') return notification.type === 'announcement';
    if (filter === 'parking') return notification.type === 'important' && notification.message.includes('parking');
    if (filter === 'seating') return notification.type === 'important' && notification.message.includes('seat');
    return false;
  });

  const totalPages = totalNotifications > 0
    ? Math.ceil(totalNotifications / notificationsPerPage)
    : 1;

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                filter={filter}
                setFilter={setFilter}
              />
              <NotificationList
                notifications={filteredNotifications}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
                error={error}
              />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded shadow w-full">
              <NotificationPreferences />
            </div>
            <div className="bg-white p-4 rounded shadow w-full">
              <EventCalendar
                date={date}
                setDate={setDate}
                eventDates={eventDates || []}
                todayEvents={events || []}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-l-md"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="px-4">Page {currentPage} of {totalPages}</span>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotification;
