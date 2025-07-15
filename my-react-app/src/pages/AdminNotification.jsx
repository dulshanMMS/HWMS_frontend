import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AdminLayout from '../components/AdminLayout';
import useAuthGuard from '../components/AuthGuard';
import EventCalendar from '../components/AdminDashboard/EventCalendar';
import NotificationFilters from '../components/Notification/NotificationFilters';
import NotificationList from '../components/Notification/NotificationList';
import NotificationPreferences from "../components/Notification/NotificationPreferences";

const API_BASE_URL = 'http://localhost:6001/api/notifications';

const socket = io('http://localhost:6001', {
  withCredentials: true,
});

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

      let endpoint = `${API_BASE_URL}?page=${currentPage}&limit=${notificationsPerPage}`;
      
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
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setTotalNotifications(data.total);
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchNotifications();
  }, [filter, dateRange, currentPage]);

  useEffect(() => {
    socket.on('notificationReceived', (notification) => {
      console.log("New notification:", notification);
      // Optionally update state or show toast/snackbar
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
  
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Token:', token);

      const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      console.log('Notification deleted successfully');

      setNotifications(notifications.filter(notification => notification._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
 

  const filteredNotifications = notifications.filter(notification => {
    // Remove searchTerm logic if not needed, otherwise keep it
    // const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                    notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = false;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'announcements') {
      matchesFilter = notification.type === 'announcement';
    } else if (filter === 'parking') {
      matchesFilter = notification.type === 'parking';
    } else if (filter === 'seating') {
      matchesFilter = notification.type === 'seating';
    }

    return matchesFilter;
  });


  // const fetchAllEvents = async () => {
  //   try {
  //     const res = await fetch(`/api/events`);
  //     const data = await res.json();
  //     if (data.success) {
  //       setAllEvents(data.events);
  //       const dates = data.events.map(event => event.date);
  //       setEventDates(dates);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching all events:', err);
  //   }
  // };


  

  

  

  // const handleClearDateRange = () => {
  //   setDateRange([null, null]);
  //   setShowClearButton(false);
  // };

  // const handleApply = () => {
  //   fetchNotifications();
  // };

  const totalPages = totalNotifications > 0 ? Math.ceil(totalNotifications / notificationsPerPage) : 1;

  // useEffect(() => {
  //   fetchAllEvents();
  // }, []);

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
                  // handleClearDateRange={handleClearDateRange}
                  // showClearButton={showClearButton}
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
               {/* Button above calendar */}
              <div className="bg-white p-4 rounded shadow w-full">
                 <NotificationPreferences />
              </div>

              {/* Calendar same width as above */}
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
          <button className="px-4 py-2 bg-gray-300 rounded-l-md" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
          <span className="px-4">Page {currentPage} of {totalPages}</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
          </div>

        {/* <button onClick={handleApply}>
          Refresh
        </button> */}
      </div>
    </AdminLayout>
  );
};

export default AdminNotification; 