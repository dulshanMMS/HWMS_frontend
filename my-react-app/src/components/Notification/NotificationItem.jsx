
import { useState, useRef, useEffect } from 'react';

const NotificationItem = ({ notification, markAsRead, markAsUnread, deleteNotification, onBulkReadChange }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRead, setIsRead] = useState(notification.read);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteButtonRef = useRef(null);
  const isAnnouncement = notification.type === 'announcement';

  // Truncate announcement to ~100 characters (adjustable based on box size)
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    // Find the last space within maxLength to avoid cutting words
    const lastSpace = text.lastIndexOf(' ', maxLength);
    return text.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  const handleToggleRead = async () => {
    try {
      if (isRead) {
        await markAsUnread(notification._id, isAnnouncement);
        setIsRead(false);
      } else {
        await markAsRead(notification._id, isAnnouncement);
        setIsRead(true);
      }
      setError(null);
    } catch (err) {
      setError(`Failed to mark as ${isRead ? 'unread' : 'read'}`);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNotification(notification._id, isAnnouncement);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Failed to delete');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Toggle announcement expansion
  const handleToggleExpand = () => {
    if (isAnnouncement) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handle click outside to close delete confirmation
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteButtonRef.current && !deleteButtonRef.current.contains(event.target)) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update isRead state when parent signals bulk read/unread change
  useEffect(() => {
    setIsRead(notification.read);
  }, [notification.read]);

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors duration-100 relative ${
        isRead ? 'bg-white' : 'bg-green-100 font-semibold text-black'
      } ${isAnnouncement ? 'cursor-pointer' : ''}`}
      onClick={handleToggleExpand}
    >
      {showSuccess && !isAnnouncement && (
        <div className="p-2 mb-2 bg-green-100 text-green-800 rounded">
          Notification deleted successfully!
        </div>
      )}
      {error && (
        <div className="p-2 mb-2 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      {isDeleting && !isAnnouncement && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
          <div className="p-4 bg-white rounded-lg shadow-md text-sm">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
              <span>Notification is deleting...</span>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && !isAnnouncement && (
        <div
          className="absolute top-2 right-12 bg-white border border-gray-200 rounded shadow-lg p-3 text-sm z-20"
          ref={deleteButtonRef}
        >
          <p>Delete notification?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={confirmDelete}
              className="px-2 py-1 bg-red-600 text-white rounded text-xs"
            >
              OK
            </button>
            <button
              onClick={cancelDelete}
              className="px-2 py-1 bg-gray-300 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-start gap-4">
        <div className="w-full">
          {isAnnouncement ? (
            <>
              <h3 className={`text-base font-bold ${isRead ? 'text-black' : 'text-black'}`}>
                📢 Announcement
              </h3>
              <p
                className={`mt-1 text-sm ${isRead ? 'text-gray-600' : 'text-black'} overflow-hidden ${
                  isExpanded
                    ? 'overflow-wrap break-word'
                    : 'text-ellipsis line-clamp-2'
                }`}
              >
                {isExpanded ? notification.message : truncateText(notification.message)}
              </p>
            </>
          ) : (
            <p className={`mt-1 text-sm ${isRead ? 'text-gray-600' : 'text-black'} overflow-hidden overflow-wrap break-word`}>
              {notification.message}
            </p>
          )}
          <span className={`mt-2 text-xs ${isRead ? 'text-gray-500' : 'text-black'}`}>
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
        {!isAnnouncement && (
          <div className="flex gap-2 items-center">
            <button
              onClick={handleToggleRead}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg w-16 border shadow hover:scale-110 transition-transform duration-200 ${
                isRead
                  ? 'bg-green-60 text-green-800 border-green-200 hover:bg-green-200'
                  : 'bg-green-700 text-white border-green-700 hover:bg-green-900'
              }`}
            >
              {isRead ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-xl"
              title="Delete notification"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;