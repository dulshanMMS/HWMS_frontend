import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './layouts/AdminSidebar';
import EventCalendar from './EventCalendar';
import AdminProfile from './AdminProfile';
import { FaFilter, FaSearch, FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './AdminNotification.css';

const API_BASE_URL = 'http://localhost:5000/api/notifications';

const AdminNotification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
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
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (error) {
      setError('Failed to load notifications. Please try again later.');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (loading) {
    return (
      <AdminSidebar>
        <div className="admin-notification-page">
          <div className="page-header">
            <h1>Admin Notifications</h1>
            <AdminProfile />
          </div>
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="admin-notification-page">
        {/* Header with Profile */}
        <div className="page-header">
          <h1>Admin Notifications</h1>
          <AdminProfile />
        </div>

        <div className="main-content">
          {/* Left side - Notifications */}
          <div className="notifications-section">
            <div className="admin-notification-container">
              {error && <div className="error-message">{error}</div>}
              
              {/* Search and Filter Bar */}
              <div className="search-filter-bar">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="advanced-filters">
                  <div className="filter-buttons">
                    <button 
                      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                      onClick={() => setFilter('unread')}
                    >
                      Unread
                    </button>
                    <button 
                      className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                      onClick={() => setFilter('read')}
                    >
                      Read
                    </button>
                  </div>
                  <div className="date-filter">
                    <FaCalendar className="calendar-icon" />
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      placeholderText="Select date range..."
                      className="date-picker"
                    />
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="notification-list">
                {filteredNotifications.length === 0 ? (
                  <div className="no-notifications">No notifications found</div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification._id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                    >
                      <div className="notification-content">
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        <span className="timestamp">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {!notification.read && (
                          <button
                            className="action-btn mark-read"
                            onClick={() => markAsRead(notification._id)}
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={() => deleteNotification(notification._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right side - Calendar */}
          <div className="calendar-section">
            <EventCalendar />
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminNotification; 