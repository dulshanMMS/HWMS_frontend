import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiBell } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const NotificationBadge = ({ isAdmin }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const endpoint = isAdmin ? '/api/notifications/all' : '/api/notifications/my';
            const response = await axios.get(endpoint);
            const notifications = isAdmin ? response.data.notifications : response.data;
            const count = notifications.filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread notifications:', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Refresh count every minute
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    return (
        <Link to="/notifications" className="relative inline-block">
            <BiBell className="text-2xl text-gray-600 hover:text-gray-800" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );
};

export default NotificationBadge; 