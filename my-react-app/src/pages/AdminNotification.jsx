
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import AdminSidebar from '../components/AdminSidebar';
// import useAuthGuard from '../components/AuthGuard';
// import EventCalendar from '../components/AdminDashboard/EventCalendar';
// import NotificationFilters from '../components/Notification/NotificationFilters';
// import NotificationList from '../components/Notification/NotificationList';
// import NotificationPreferences from "../components/Notification/NotificationPreferences";
// import NotificationBadge from '../components/Notification/NotificationBadge';
// import PaginationControls from '../components/Notification/PaginationControls';

// const API_BASE_URL = '/api/notifications/admin/own';
// const ANNOUNCEMENT_API_URL = '/api/announcements';

// const socket = io('/', { withCredentials: true });

// const AdminNotification = () => {
//   useAuthGuard('admin');
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [date, setDate] = useState(new Date());
//   const [allEvents, setAllEvents] = useState([]);
//   const [eventDates, setEventDates] = useState([]);
//   const [showEventModal, setShowEventModal] = useState(false);
//   const [events, setEvents] = useState([]);
//   const [showClearButton, setShowClearButton] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const notificationsPerPage = 10;
//   const [totalNotifications, setTotalNotifications] = useState(0);

//   const deduplicateNotifications = (notifications) => {
//     const seen = new Set();
//     return notifications.filter(n => {
//       const key = `${n.bookingId || n._id}-${n.message}-${n.type}-${n.createdAt}`;
//       if (seen.has(key)) {
//         console.log(`Duplicate notification filtered: ${key}`);
//         return false;
//       }
//       seen.add(key);
//       return true;
//     });
//   };

//   const fetchNotifications = async (page = currentPage) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Please log in to view notifications');
//         setLoading(false);
//         return;
//       }

//       let notificationData = { notifications: [], total: 0 };
//       let announcementData = { announcements: [], total: 0 };
//       let totalNotificationsCount = 0;

//       // Fetch notifications based on filter
//       if (filter === 'all' || filter === 'parking' || filter === 'seating') {
//         const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filter}`;
//         const notificationResponse = await fetch(notificationEndpoint, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (notificationResponse.status === 401 || notificationResponse.status === 403) {
//           console.error('Authentication error:', notificationResponse.status);
//           localStorage.removeItem('token');
//           navigate('/');
//           return;
//         }

//         if (!notificationResponse.ok) {
//           const errorText = await notificationResponse.text();
//           throw new Error(`Failed to fetch notifications: ${errorText}`);
//         }

//         notificationData = await notificationResponse.json();
//         if (!Array.isArray(notificationData.notifications)) {
//           throw new Error('Invalid notification response format');
//         }
//         totalNotificationsCount += notificationData.total;
//       }

//       // Fetch announcements if filter is 'all' or 'announcements'
//       if (filter === 'all' || filter === 'announcements') {
//         const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}`;
//         const announcementResponse = await fetch(announcementEndpoint, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!announcementResponse.ok) {
//           const errorText = await announcementResponse.text();
//           throw new Error(`Failed to fetch announcements: ${errorText}`);
//         }

//         announcementData = await announcementResponse.json();
//         if (!Array.isArray(announcementData.announcements)) {
//           throw new Error('Invalid announcement response format');
//         }
//         totalNotificationsCount += announcementData.total;
//       }

//       const normalizedAnnouncements = announcementData.announcements.map(ann => ({
//         _id: ann._id,
//         message: ann.message,
//         type: 'announcement',
//         read: false,
//         createdAt: ann.createdAt,
//         sender: ann.sender,
//       }));

//       const combinedNotifications = deduplicateNotifications(
//         [...notificationData.notifications, ...(filter === 'all' || filter === 'announcements' ? normalizedAnnouncements : [])]
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .slice(0, notificationsPerPage)
//       );

//       setNotifications(combinedNotifications);
//       setTotalNotifications(totalNotificationsCount);

//       // Fetch unread count
//       const unreadResponse = await fetch('/api/notifications/admin/unread-count', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (unreadResponse.ok) {
//         const unreadData = await unreadResponse.json();
//         setUnreadCount(unreadData.count);
//       }
//     } catch (error) {
//       console.error('Error in fetchNotifications:', error.message);
//       setError(`Failed to fetch notifications or announcements: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications(currentPage);
//   }, [filter, dateRange, currentPage]);

//   useEffect(() => {
//     const seenNotifications = new Set(notifications.map(n => `${n._id}-${n.message}`));

//     socket.on('notificationReceived', (notification) => {
//       const key = `${notification._id}-${notification.message}`;
//       if (seenNotifications.has(key)) {
//         console.log(`Duplicate notification received via socket: ${key}`);
//         return;
//       }
//       seenNotifications.add(key);
//       setNotifications(prev => deduplicateNotifications([notification, ...prev]));
//       setUnreadCount(prev => prev + 1);
//     });

//     socket.on('announcementReceived', (announcement) => {
//       const key = `${announcement._id}-${announcement.message}`;
//       if (seenNotifications.has(key)) {
//         console.log(`Duplicate announcement received via socket: ${key}`);
//         return;
//       }
//       seenNotifications.add(key);
//       const normalizedAnnouncement = {
//         _id: announcement._id,
//         message: announcement.message,
//         type: 'announcement',
//         read: false,
//         createdAt: announcement.createdAt,
//         sender: announcement.sender,
//       };
//       setNotifications(prev => deduplicateNotifications([normalizedAnnouncement, ...prev]));
//       setUnreadCount(prev => prev + 1);
//     });

//     return () => {
//       socket.off('notificationReceived');
//       socket.off('announcementReceived');
//     };
//   }, [notifications]);

//   const markAsRead = async (id, isAnnouncement = false) => {
//     try {
//       const token = localStorage.getItem('token');
//       const endpoint = isAnnouncement
//         ? `${ANNOUNCEMENT_API_URL}/${id}/mark-read`
//         : `/api/notifications/${id}/mark-read`;
//       const response = await fetch(endpoint, {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);

//       setNotifications(notifications.map(n =>
//         n._id === id ? { ...n, read: true } : n
//       ));
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (error) {
//       setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);
//     }
//   };

//   const markAsUnread = async (id, isAnnouncement = false) => {
//     try {
//       const token = localStorage.getItem('token');
//       const endpoint = isAnnouncement
//         ? `${ANNOUNCEMENT_API_URL}/${id}/mark-unread`
//         : `/api/notifications/${id}/mark-unread`;
//       const response = await fetch(endpoint, {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);

//       setNotifications(notifications.map(n =>
//         n._id === id ? { ...n, read: false } : n
//       ));
//       setUnreadCount(prev => prev + 1);
//     } catch (error) {
//       setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);
//     }
//   };

//   const deleteNotification = async (notificationId, isAnnouncement = false) => {
//     try {
//       const token = localStorage.getItem('token');
//       const endpoint = isAnnouncement
//         ? `${ANNOUNCEMENT_API_URL}/${notificationId}`
//         : `/api/notifications/${notificationId}`;
//       const response = await fetch(endpoint, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);

//       setNotifications(notifications.filter(n => n._id !== notificationId));
//       if (!notifications.find(n => n._id === notificationId).read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
//       // Refetch to fill page if needed
//       if (notifications.length <= notificationsPerPage && currentPage <= totalNotifications / notificationsPerPage) {
//         fetchNotifications(currentPage);
//       }
//     } catch (error) {
//       console.error(`Error deleting ${isAnnouncement ? 'announcement' : 'notification'}:`, error);
//     }
//   };

//   const filteredNotifications = notifications.filter(notification => {
//     const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
//     if (!matchesSearch) return false;

//     if (filter === 'all') return true;
//     if (filter === 'announcements') return notification.type === 'announcement';
//     if (filter === 'parking') return notification.type === 'important' && notification.message.includes('parking');
//     if (filter === 'seating') return notification.type === 'important' && notification.message.includes('seat');
//     return false;
//   });

//   const paginatedNotifications = filteredNotifications.slice(
//     (currentPage - 1) * notificationsPerPage,
//     currentPage * notificationsPerPage
//   );

//   const totalPages = totalNotifications > 0
//     ? Math.ceil(totalNotifications / notificationsPerPage)
//     : 1;

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <AdminSidebar>
//       <div className="flex items-center gap-4 ml-8 mt-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
//         <NotificationBadge isAdmin={true} />
//       </div>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-md">
//               <NotificationFilters
//                 filter={filter}
//                 setFilter={setFilter}
//               />
//               <NotificationList
//                 notifications={paginatedNotifications}
//                 markAsRead={markAsRead}
//                 markAsUnread={markAsUnread}
//                 deleteNotification={deleteNotification}
//                 error={error}
//                 unreadCount={unreadCount}
//               />
//               <PaginationControls
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 setCurrentPage={setCurrentPage}
//               />
//             </div>
//           </div>
//           <div className="lg:col-span-1 flex flex-col gap-4">
//             <div className="bg-white p-4 rounded shadow w-full">
//               <NotificationPreferences />
//             </div>
//             <div className="bg-white p-4 rounded shadow w-full">
//               <EventCalendar
//                 date={date}
//                 setDate={setDate}
//                 eventDates={eventDates || []}
//                 todayEvents={events || []}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminSidebar>
//   );
// };

// export default AdminNotification;

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { debounce } from 'lodash';
import AdminSidebar from '../components/AdminSidebar';
import useAuthGuard from '../components/AuthGuard';
import EventCalendar from '../components/AdminDashboard/EventCalendar';
import NotificationFilters from '../components/Notification/NotificationFilters';
import NotificationList from '../components/Notification/NotificationList';
import NotificationPreferences from "../components/Notification/NotificationPreferences";
import NotificationBadge from '../components/Notification/NotificationBadge';
import PaginationControls from '../components/Notification/PaginationControls';

const API_BASE_URL = '/api/notifications/admin/own';
const ANNOUNCEMENT_API_URL = '/api/announcements';

const socket = io('/', { withCredentials: true });

const AdminNotification = () => {
  useAuthGuard('admin');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [filterLoading, setFilterLoading] = useState(false); // For filter changes
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [showClearButton, setShowClearButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const notificationsPerPage = 10;

  const deduplicateNotifications = (notifications) => {
    const seen = new Set();
    return notifications.filter(n => {
      const key = `${n.bookingId || n._id}-${n.message}-${n.type}-${n.createdAt}`;
      if (seen.has(key)) {
        console.log(`Duplicate notification filtered: ${key}`);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const fetchNotifications = useCallback(
    debounce(async (page = 1) => {
      try {
        setFilterLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view notifications');
          setFilterLoading(false);
          setInitialLoading(false);
          return;
        }

        let notificationData = { notifications: [], total: 0 };
        let announcementData = { announcements: [], total: 0 };
        let totalNotificationsCount = 0;

        if (filter === 'all' || filter === 'parking' || filter === 'seating') {
          const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filter}`;
          console.log(`Fetching notifications: ${notificationEndpoint}`);
          const notificationResponse = await fetch(notificationEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (notificationResponse.status === 401 || notificationResponse.status === 403) {
            console.error('Authentication error:', notificationResponse.status);
            localStorage.removeItem('token');
            navigate('/');
            return;
          }

          if (!notificationResponse.ok) {
            const errorText = await notificationResponse.text();
            throw new Error(`Failed to fetch notifications: ${errorText}`);
          }

          notificationData = await notificationResponse.json();
          if (!Array.isArray(notificationData.notifications)) {
            throw new Error('Invalid notification response format');
          }
          totalNotificationsCount += notificationData.total;
        }

        if (filter === 'all' || filter === 'announcements') {
          const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}`;
          console.log(`Fetching announcements: ${announcementEndpoint}`);
          const announcementResponse = await fetch(announcementEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!announcementResponse.ok) {
            const errorText = await announcementResponse.text();
            throw new Error(`Failed to fetch announcements: ${errorText}`);
          }

          announcementData = await announcementResponse.json();
          if (!Array.isArray(announcementData.announcements)) {
            throw new Error('Invalid announcement response format');
          }
          totalNotificationsCount += announcementData.total;
        }

        const normalizedAnnouncements = announcementData.announcements.map(ann => ({
          _id: ann._id,
          message: ann.message,
          type: 'announcement',
          read: ann.read || false,
          createdAt: ann.createdAt,
          sender: ann.sender,
        }));

        const combinedNotifications = deduplicateNotifications(
          [...notificationData.notifications, ...(filter === 'all' || filter === 'announcements' ? normalizedAnnouncements : [])]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, notificationsPerPage)
        );

        setNotifications(combinedNotifications);
        setTotalNotifications(totalNotificationsCount);

        const unreadResponse = await fetch('/api/notifications/admin/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json();
          setUnreadCount(unreadData.count);
          console.log(`Unread count: ${unreadData.count}`);
        }
      } catch (error) {
        console.error('Error in fetchNotifications:', error.message);
        setError(`Failed to fetch notifications or announcements: ${error.message}`);
      } finally {
        setFilterLoading(false);
        setInitialLoading(false);
      }
    }, 300),
    [filter, navigate]
  );

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [filter, currentPage, fetchNotifications]);

  useEffect(() => {
    const seenNotifications = new Set(notifications.map(n => `${n._id}-${n.message}`));

    socket.on('notificationReceived', (notification) => {
      const key = `${notification._id}-${notification.message}`;
      if (seenNotifications.has(key)) {
        console.log(`Duplicate notification received via socket: ${key}`);
        return;
      }
      seenNotifications.add(key);
      setNotifications(prev => deduplicateNotifications([
        notification,
        ...prev.filter(n => filter === 'all' || n.type === filter || (filter === 'parking' && (n.type === 'parking_booking' || n.type === 'parking_cancellation')) || (filter === 'seating' && (n.type === 'seat_booking' || n.type === 'seat_cancellation')))
      ]));
      setUnreadCount(prev => prev + 1);
    });

    socket.on('announcementReceived', (announcement) => {
      const key = `${announcement._id}-${announcement.message}`;
      if (seenNotifications.has(key)) {
        console.log(`Duplicate announcement received via socket: ${key}`);
        return;
      }
      seenNotifications.add(key);
      const normalizedAnnouncement = {
        _id: announcement._id,
        message: announcement.message,
        type: 'announcement',
        read: false,
        createdAt: announcement.createdAt,
        sender: announcement.sender,
      };
      setNotifications(prev => deduplicateNotifications([
        normalizedAnnouncement,
        ...prev.filter(n => filter === 'all' || n.type === 'announcement')
      ]));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('notificationReceived');
      socket.off('announcementReceived');
    };
  }, [filter, notifications]);

  const markAsRead = async (id, isAnnouncement = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAnnouncement
        ? `${ANNOUNCEMENT_API_URL}/${id}/mark-read`
        : `/api/notifications/${id}/mark-read`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);

      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);
    }
  };

  const markAsUnread = async (id, isAnnouncement = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAnnouncement
        ? `${ANNOUNCEMENT_API_URL}/${id}/mark-unread`
        : `/api/notifications/${id}/mark-unread`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);

      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: false } : n
      ));
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);
    }
  };

  const deleteNotification = async (notificationId, isAnnouncement = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAnnouncement
        ? `${ANNOUNCEMENT_API_URL}/${notificationId}`
        : `/api/notifications/${notificationId}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);

      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notifications.length <= notificationsPerPage && currentPage < Math.ceil(totalNotifications / notificationsPerPage)) {
        fetchNotifications(currentPage + 1);
      } else {
        fetchNotifications(currentPage);
      }
    } catch (error) {
      console.error(`Error deleting ${isAnnouncement ? 'announcement' : 'notification'}:`, error);
      setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'announcements') return notification.type === 'announcement';
    if (filter === 'parking') return notification.type === 'parking_booking' || notification.type === 'parking_cancellation' || (notification.type === 'important' && notification.message.toLowerCase().includes('parking'));
    if (filter === 'seating') return notification.type === 'seat_booking' || notification.type === 'seat_cancellation' || (notification.type === 'important' && notification.message.toLowerCase().includes('seat'));
    return false;
  });

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const totalPages = totalNotifications > 0
    ? Math.ceil(totalNotifications / notificationsPerPage)
    : 1;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex items-center gap-4 ml-8 mt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        <NotificationBadge isAdmin={true} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                filter={filter}
                setFilter={setFilter}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                isFilterLoading={filterLoading}
              />
              <NotificationList
                notifications={paginatedNotifications}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                deleteNotification={deleteNotification}
                error={error}
                unreadCount={unreadCount}
              />
              <PaginationControls
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded shadow w-full">
              <NotificationPreferences />
            </div>
            <div className="bg-white p-4 rounded shadow w-full">
              <EventCalendar
                date={date}
                setDate={setDate}
                eventDates={eventDates || []}
                todayEvents={events || []}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminNotification;