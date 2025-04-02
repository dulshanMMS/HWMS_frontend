import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheck, FaTrash, FaClock } from 'react-icons/fa';

const UserNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications/user');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/mark-read`);
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(notif => notif._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notif => !notif.read);
      case 'read':
        return notifications.filter(notif => notif.read);
      default:
        return notifications;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FaBell className="mr-2 text-green-600" />
            Notifications
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md ${
                filter === 'unread'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-md ${
                filter === 'read'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {getFilteredNotifications().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications found
            </div>
          ) : (
            getFilteredNotifications().map((notification) => (
              <div
                key={notification._id}
                className={`border rounded-lg p-4 transition-all ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <FaClock className="mr-1" />
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotification;