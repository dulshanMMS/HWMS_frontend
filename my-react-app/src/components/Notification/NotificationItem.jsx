import { useState } from 'react';

const NotificationItem = ({ notification, markAsRead, deleteNotification }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRead, setIsRead] = useState(notification.read);

  const handleMarkAsRead = () => {
    markAsRead(notification._id);
    setIsRead(true);
  };

  const handleMarkAsUnread = () => {
    
    setIsRead(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification(notification._id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 8000); // Hide success message after 8 seconds
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
        isRead ? 'bg-white' : 'bg-blue-50'
      }`}
    >
      {showSuccess && (
        <div className="p-2 mb-2 bg-green-100 text-green-800 rounded">
          Notification deleted successfully!
        </div>
      )}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{notification.title}</h3>
          <p className="mt-1 text-gray-600">{notification.message}</p>
          <span className="mt-2 text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          {isRead ? (
            <button
              onClick={handleMarkAsUnread}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-lg w-24"
            >
              Mark as Unread
            </button>
          ) : (
            <button
              onClick={handleMarkAsRead}
              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-lg w-24"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-lg w-24"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
