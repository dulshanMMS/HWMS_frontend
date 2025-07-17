import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useAuthGuard from "../components/AuthGuard";
import LeftSidebar from "../components/LeftSidebar";
import CalendarCard from "../components/CalendarCard";
import NotificationFilters from "../components/Notification/NotificationFilters";
import NotificationList from "../components/Notification/NotificationList";
import NotificationPreferences from "../components/Notification/NotificationPreferences";

const API_BASE_URL = '/api/notifications/user/own';

const socket = io('/', { withCredentials: true });

const UserNotification = () => {
  useAuthGuard('user');
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
      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        return;
      }
  
      const endpoint = `${API_BASE_URL}?page=${currentPage}&limit=${notificationsPerPage}`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/userdashboard');
        return;
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
  
      const data = await response.json();
      console.log('Fetched notifications:', data); // Debug log
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setTotalNotifications(data.total);
      } else {
        console.error('Notifications data is not an array:', data);
        setError('Invalid notifications data');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, dateRange, currentPage]);

  useEffect(() => {
    socket.on('notificationReceived', (notification) => {
      // Optionally show toast or update state
    });

    return () => {
      socket.off('notificationReceived');
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${id}/read`, {
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
      const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      setError('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAllEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setAllEvents(data.events);
        setEventDates(data.events.map(e => e.date));
      }
    } catch (err) {}
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/events/${formattedDate}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {}
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchEventsForDate(value);
    setShowEventModal(true);
  };

  const handleClearDateRange = () => {
    setDateRange([null, null]);
    setShowClearButton(false);
  };

  const handleApply = () => {
    fetchNotifications();
  };

  const totalPages = totalNotifications > 0
    ? Math.ceil(totalNotifications / notificationsPerPage)
    : 1;

  useEffect(() => {
    fetchAllEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LeftSidebar>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-6 ml-8">Notifications</h1>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                handleClearDateRange={handleClearDateRange}
                showClearButton={showClearButton}
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
              <CalendarCard />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded-l-md" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
          <span className="px-4">Page {currentPage} of {totalPages}</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </LeftSidebar>
  );
};

export default UserNotification;
