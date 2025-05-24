import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, markAsRead, deleteNotification, error }) => {
  return (
    <div className="divide-y divide-gray-200">
      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No notifications found
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;
