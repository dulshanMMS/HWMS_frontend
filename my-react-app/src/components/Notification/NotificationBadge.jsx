
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BiBell } from 'react-icons/bi';

const NotificationBadge = ({ isAdmin }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No token found for NotificationBadge API request');
                return;
            }
            const endpoint = isAdmin ? '/api/notifications/admin/unread-count' : '/api/notifications/unread-count';
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('NotificationBadge API response:', response.data); // Debug log
            const count = response.data.count || 0; // Ensure count is a number
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread notifications:', err.message, err.response?.data); // Detailed error log
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh count every minute
        const interval = setInterval(fetchUnreadCount, 60);
        return () => clearInterval(interval);
    }, [isAdmin]);

    return (
        <div className="relative inline-block">
            <BiBell className="text-4xl text-gray-600 hover:text-gray-800 mt-[-4px]" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationBadge;