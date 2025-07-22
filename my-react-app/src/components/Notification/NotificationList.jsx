import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, markAsRead, markAsUnread, deleteNotification, error, unreadCount }) => {
  return (
    <div className="divide-y divide-gray-200">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications available
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            markAsRead={markAsRead}
            markAsUnread={markAsUnread}
            deleteNotification={deleteNotification}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;