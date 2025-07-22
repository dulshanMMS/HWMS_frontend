// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { BiBell } from 'react-icons/bi';
// import { Link } from 'react-router-dom';

// const NotificationBadge = ({ isAdmin }) => {
//     const [unreadCount, setUnreadCount] = useState(0);

//     const fetchUnreadCount = async () => {
//         try {
//             const endpoint = isAdmin ? '/api/admin/unread-count' : '/api//unread-count';
//             const response = await axios.get(endpoint);
//             const notifications = isAdmin ? response.data.notifications : response.data;
//             const count = notifications.filter(n => !n.isRead).length;
//             setUnreadCount(count);
//         } catch (err) {
//             console.error('Error fetching unread notifications:', err);
//         }
//     };

//     useEffect(() => {
//         fetchUnreadCount();
//         // Refresh count every minute
//         const interval = setInterval(fetchUnreadCount, 60000);
//         return () => clearInterval(interval);
//     }, [isAdmin]);

//     return (
//         <Link to="/notifications" className="relative inline-block">
//             <BiBell className="text-2xl text-gray-600 hover:text-gray-800" />
//             {unreadCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {unreadCount > 99 ? '99+' : unreadCount}
//                 </span>
//             )}
//         </Link>
//     );
// };

// export default NotificationBadge; 

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