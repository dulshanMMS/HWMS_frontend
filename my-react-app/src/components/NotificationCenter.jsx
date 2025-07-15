import axios from 'axios';
import { useEffect, useState } from 'react';
import { BiBell, BiCheck, BiTrash } from 'react-icons/bi';

const NotificationCenter = ({ isAdmin }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const endpoint = isAdmin ? '/api/notifications/all' : '/api/notifications/my';
            const response = await axios.get(endpoint, {
                params: { page, limit: 10 }
            });
            
            if (isAdmin) {
                const { notifications: newNotifications, pagination } = response.data;
                setNotifications(page === 1 ? newNotifications : [...notifications, ...newNotifications]);
                setHasMore(page < pagination.pages);
            } else {
                setNotifications(page === 1 ? response.data : [...notifications, ...response.data]);
                setHasMore(response.data.length === 10);
            }
            
            setError(null);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page, isAdmin]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(notif =>
                notif._id === id ? { ...notif, isRead: true } : notif
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

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking_update':
                return '🔄';
            case 'reminder':
                return '⏰';
            case 'system':
                return '🔧';
            case 'admin_alert':
                return '⚠️';
            default:
                return '📢';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BiBell className="text-3xl" />
                    Notifications
                </h1>
                <span className="text-sm text-gray-500">
                    {notifications.filter(n => !n.isRead).length} unread
                </span>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {notifications.map(notification => (
                    <div
                        key={notification._id}
                        className={`p-4 rounded-lg shadow-sm border ${
                            notification.isRead ? 'bg-white' : 'bg-blue-50'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">
                                    {getNotificationIcon(notification.type)}
                                </span>
                                <div>
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    <p className="text-gray-600">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                        title="Mark as read"
                                    >
                                        <BiCheck className="text-xl text-green-600" />
                                    </button>
                                )}
                                {isAdmin && (
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                        title="Delete notification"
                                    >
                                        <BiTrash className="text-xl text-red-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-center py-4">
                        Loading notifications...
                    </div>
                )}

                {hasMore && !loading && (
                    <button
                        onClick={loadMore}
                        className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                        Load More
                    </button>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No notifications to display
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter; 