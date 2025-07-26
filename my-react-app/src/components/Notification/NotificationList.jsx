import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, markAsRead, markAsUnread, deleteNotification, error, unreadCount, bulkReadState }) => {
  return (
    <div className="divide-y divide-gray-200">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications found.</div>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            markAsRead={markAsRead}
            markAsUnread={markAsUnread}
            deleteNotification={deleteNotification}
            onBulkReadChange={bulkReadState}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;