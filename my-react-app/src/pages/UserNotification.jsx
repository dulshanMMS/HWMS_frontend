// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import useAuthGuard from "../components/AuthGuard";
// import LeftSidebar from "../components/LeftSidebar";
// import CalendarCard from "../components/CalendarCard";
// import NotificationFilters from "../components/Notification/NotificationFilters";
// import NotificationList from "../components/Notification/NotificationList";
// import NotificationPreferences from "../components/Notification/NotificationPreferences";
// import PaginationControls from "../components/Notification/PaginationControls";
// import NotificationBadge from "../components/Notification/NotificationBadge";

// const API_BASE_URL = '/api/notifications/user/own';
// const ANNOUNCEMENT_API_URL = '/api/announcements';

// const socket = io('/', { withCredentials: true });

// const UserNotification = () => {
//   useAuthGuard('user');
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState({
//     all: [],
//     announcements: [],
//     parking: [],
//     seating: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);
  
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [date, setDate] = useState(new Date());
//   const [allEvents, setAllEvents] = useState([]);
//   const [eventDates, setEventDates] = useState([]);
//   const [showEventModal, setShowEventModal] = useState(false);
//   const [events, setEvents] = useState([]);
//   const [showClearButton, setShowClearButton] = useState(false);
//   const [pagination, setPagination] = useState({
//     all: { currentPage: 1, totalPages: 1 },
//     announcements: { currentPage: 1, totalPages: 1 },
//     parking: { currentPage: 1, totalPages: 1 },
//     seating: { currentPage: 1, totalPages: 1 },
//   });
//   const [unreadCount, setUnreadCount] = useState(0);
//   const notificationsPerPage = 10;



// const deduplicateNotifications = (notifications) => {
//   const seen = new Set();
//   return notifications.filter(n => {
//     const key = `${n.bookingId || n._id}-${n.message}-${n.type}-${n.createdAt}`;
//     if (seen.has(key)) {
//       console.log(`Duplicate notification filtered: ${key}`);
//       return false;
//     }
//     seen.add(key);
//     return true;
//   });
// };

//   const fetchNotifications = async (filterType, page = 1) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Please log in to view notifications');
//         setLoading(false);
//         return;
//       }

//       let notificationData = [];
//       let announcementData = [];
//       let totalNotifications = 0;

//       if (filterType === 'all' || filterType === 'parking' || filterType === 'seating') {
//         const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filterType}`;
//         const notificationResponse = await fetch(notificationEndpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (notificationResponse.status === 401) {
//           localStorage.removeItem('token');
//           navigate('/userdashboard');
//           return;
//         }

//         if (!notificationResponse.ok) {
//           throw new Error('Failed to fetch notifications');
//         }

//         notificationData = await notificationResponse.json();
//         if (!Array.isArray(notificationData.notifications)) {
//           throw new Error('Invalid notification response format');
//         }
//         totalNotifications += notificationData.total;
//       }

//       if (filterType === 'all' || filterType === 'announcements') {
//         const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}`;
//         const announcementResponse = await fetch(announcementEndpoint, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!announcementResponse.ok) {
//           throw new Error('Failed to fetch announcements');
//         }

//         announcementData = await announcementResponse.json();
//         if (!Array.isArray(announcementData.announcements)) {
//           throw new Error('Invalid announcement response format');
//         }
//         totalNotifications += announcementData.total;
//       }

//       const normalizedAnnouncements = announcementData.announcements
//         ? announcementData.announcements.map(ann => ({
//             _id: ann._id,
//             message: ann.message,
//             type: 'announcement',
//             read: false,
//             createdAt: ann.createdAt,
//             sender: ann.sender,
//           }))
//         : [];

//       const combinedNotifications = deduplicateNotifications(
//         [...(notificationData.notifications || []), ...normalizedAnnouncements]
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .slice(0, notificationsPerPage)
//       );

//       setNotifications(prev => ({
//         ...prev,
//         [filterType]: combinedNotifications,
//       }));

//       setPagination(prev => ({
//         ...prev,
//         [filterType]: {
//           currentPage: page,
//           totalPages: Math.ceil(totalNotifications / notificationsPerPage) || 1,
//         },
//       }));

//       const unreadResponse = await fetch('/api/notifications/unread-count', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (unreadResponse.ok) {
//         const unreadData = await unreadResponse.json();
//         setUnreadCount(unreadData.count);
//       }
//     } catch (error) {
//       console.error('Error fetching notifications or announcements:', error);
//       setError('Failed to fetch notifications or announcements');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications(filter, pagination[filter].currentPage);
//   }, [filter, pagination[filter].currentPage]);

//   useEffect(() => {
//     const seenNotifications = new Set();

//     socket.on('notificationReceived', (notification) => {
//       const key = `${notification._id}-${notification.message}`;
//       if (seenNotifications.has(key)) {
//         console.log(`Duplicate notification received via socket: ${key}`);
//         return;
//       }
//       seenNotifications.add(key);
//       setNotifications(prev => ({
//         ...prev,
//         all: deduplicateNotifications([notification, ...prev.all]).slice(0, notificationsPerPage),
//         [notification.type]: deduplicateNotifications([notification, ...prev[notification.type]]).slice(0, notificationsPerPage),
//       }));
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
//       setNotifications(prev => ({
//         ...prev,
//         all: deduplicateNotifications([normalizedAnnouncement, ...prev.all]).slice(0, notificationsPerPage),
//         announcements: deduplicateNotifications([normalizedAnnouncement, ...prev.announcements]).slice(0, notificationsPerPage),
//       }));
//       setUnreadCount(prev => prev + 1);
//     });

//     return () => {
//       socket.off('notificationReceived');
//       socket.off('announcementReceived');
//     };
//   }, []);

//   const markAsRead = async (id, isAnnouncement = false) => {
//     try {
//       const token = localStorage.getItem('token');
//       const endpoint = isAnnouncement
//         ? `${ANNOUNCEMENT_API_URL}/${id}/read`
//         : `/api/notifications/${id}/mark-read`;
//       const response = await fetch(endpoint, {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);

//       setNotifications(prev => ({
//         ...prev,
//         [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: true } : n)),
//       }));
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

//       setNotifications(prev => ({
//         ...prev,
//         [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: false } : n)),
//       }));
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

//       setNotifications(prev => ({
//         ...prev,
//         [filter]: prev[filter].filter(n => n._id !== notificationId),
//       }));
//       if (!notifications[filter].find(n => n._id === notificationId)?.read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }

//       // If fewer than 10 notifications remain and not on the last page, fetch next page
//       const updatedNotifications = notifications[filter].filter(n => n._id !== notificationId);
//       if (updatedNotifications.length < notificationsPerPage && pagination[filter].currentPage < pagination[filter].totalPages) {
//         setPagination(prev => ({
//           ...prev,
//           [filter]: { ...prev[filter], currentPage: prev[filter].currentPage + 1 },
//         }));
//         await fetchNotifications(filter, pagination[filter].currentPage + 1);
//       } else {
//         // Otherwise, refetch current page to fill up to 10 if possible
//         await fetchNotifications(filter, pagination[filter].currentPage);
//       }
//     } catch (error) {
//       setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
//     }
//   };

//   const filteredNotifications = notifications[filter].filter(notification => {
  
    
//     if (filter === 'all') return true;
//     if (filter === 'announcements') return notification.type === 'announcement';
//     if (filter === 'parking') return notification.type === 'parking';
//     if (filter === 'seating') return notification.type === 'seating';
//     return false;
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <LeftSidebar>
//       <div className="flex items-center gap-4 ml-8 mt-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
//         <NotificationBadge isAdmin={false} />
//       </div>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-md">
//               <NotificationFilters
//                 filter={filter}
//                 setFilter={setFilter}
//                 currentPage={pagination[filter].currentPage}
//                 // setCurrentPage={handleSetPage(filter)}
//                 totalPages={pagination[filter].totalPages}
                
//               />
//               <NotificationList
//                 notifications={filteredNotifications}
//                 markAsRead={markAsRead}
//                 markAsUnread={markAsUnread}
//                 deleteNotification={deleteNotification}
//                 error={error}
//                 unreadCount={unreadCount}
//               />
//               <PaginationControls
//                 currentPage={pagination[filter].currentPage}
//                 // setCurrentPage={handleSetPage(filter)}
//                 totalPages={pagination[filter].totalPages}
//               />
//             </div>
//           </div>
//           <div className="lg:col-span-1 flex flex-col gap-4">
//             <div className="bg-white p-4 rounded shadow w-full">
//               <NotificationPreferences />
//             </div>
//             <div className="bg-white p-2 rounded shadow w-full">
//   <div className="w-full max-w-[260px] sm:max-w-[300px]  transform scale-75 origin-top-left">
//     <CalendarCard />
//   </div>
// </div>

//           </div>
//         </div>
//       </div>
//     </LeftSidebar>
//   );
// };

// export default UserNotification;

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { debounce } from "lodash";
import useAuthGuard from "../components/AuthGuard";
import LeftSidebar from "../components/LeftSidebar";
import CalendarCard from "../components/CalendarCard";
import NotificationFilters from "../components/Notification/NotificationFilters";
import NotificationList from "../components/Notification/NotificationList";
import NotificationPreferences from "../components/Notification/NotificationPreferences";
import PaginationControls from "../components/Notification/PaginationControls";
import NotificationBadge from "../components/Notification/NotificationBadge";

const API_BASE_URL = '/api/notifications/user/own';
const ANNOUNCEMENT_API_URL = '/api/announcements';

const socket = io('/', { withCredentials: true });

const UserNotification = () => {
  useAuthGuard('user');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    all: [],
    announcements: [],
    parking: [],
    seating: [],
  });
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [filterLoading, setFilterLoading] = useState(false); // For filter changes
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [showClearButton, setShowClearButton] = useState(false);
  const [pagination, setPagination] = useState({
    all: { currentPage: 1, totalPages: 1 },
    announcements: { currentPage: 1, totalPages: 1 },
    parking: { currentPage: 1, totalPages: 1 },
    seating: { currentPage: 1, totalPages: 1 },
  });
  const [unreadCount, setUnreadCount] = useState(0);
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
    debounce(async (filterType, page = 1) => {
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
        let totalNotifications = 0;

        if (filterType === 'all' || filterType === 'parking' || filterType === 'seating') {
          const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filterType}`;
          console.log(`Fetching notifications: ${notificationEndpoint}`);
          const notificationResponse = await fetch(notificationEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (notificationResponse.status === 401) {
            localStorage.removeItem('token');
            navigate('/userdashboard');
            return;
          }

          if (!notificationResponse.ok) {
            throw new Error('Failed to fetch notifications');
          }

          notificationData = await notificationResponse.json();
          if (!Array.isArray(notificationData.notifications)) {
            throw new Error('Invalid notification response format');
          }
          totalNotifications += notificationData.total;
        }

        if (filterType === 'all' || filterType === 'announcements') {
          const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}`;
          console.log(`Fetching announcements: ${announcementEndpoint}`);
          const announcementResponse = await fetch(announcementEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!announcementResponse.ok) {
            throw new Error('Failed to fetch announcements');
          }

          announcementData = await announcementResponse.json();
          if (!Array.isArray(announcementData.announcements)) {
            throw new Error('Invalid announcement response format');
          }
          totalNotifications += announcementData.total;
        }

        const normalizedAnnouncements = announcementData.announcements
          ? announcementData.announcements.map(ann => ({
              _id: ann._id,
              message: ann.message,
              type: 'announcement',
              read: ann.read || false,
              createdAt: ann.createdAt,
              sender: ann.sender,
            }))
          : [];

        const combinedNotifications = deduplicateNotifications(
          [...(notificationData.notifications || []), ...normalizedAnnouncements]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, notificationsPerPage)
        );

        setNotifications(prev => ({
          ...prev,
          [filterType]: combinedNotifications,
        }));

        setPagination(prev => ({
          ...prev,
          [filterType]: {
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / notificationsPerPage) || 1,
          },
        }));

        const unreadResponse = await fetch('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json();
          setUnreadCount(unreadData.count);
          console.log(`Unread count: ${unreadData.count}`);
        }
      } catch (error) {
        console.error('Error fetching notifications or announcements:', error);
        setError('Failed to fetch notifications or announcements');
      } finally {
        setFilterLoading(false);
        setInitialLoading(false);
      }
    }, 300),
    [navigate]
  );

  useEffect(() => {
    fetchNotifications(filter, pagination[filter].currentPage);
  }, [filter, pagination[filter].currentPage, fetchNotifications]);

  useEffect(() => {
    const seenNotifications = new Set();

    socket.on('notificationReceived', (notification) => {
      const key = `${notification._id}-${notification.message}`;
      if (seenNotifications.has(key)) {
        console.log(`Duplicate notification received via socket: ${key}`);
        return;
      }
      seenNotifications.add(key);
      setNotifications(prev => ({
        ...prev,
        all: deduplicateNotifications([notification, ...prev.all]).slice(0, notificationsPerPage),
        [notification.type === 'parking_booking' || notification.type === 'parking_cancellation' ? 'parking' : notification.type === 'seat_booking' || notification.type === 'seat_cancellation' ? 'seating' : 'all']: deduplicateNotifications([notification, ...prev[notification.type === 'parking_booking' || notification.type === 'parking_cancellation' ? 'parking' : notification.type === 'seat_booking' || notification.type === 'seat_cancellation' ? 'seating' : 'all']]).slice(0, notificationsPerPage),
      }));
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
      setNotifications(prev => ({
        ...prev,
        all: deduplicateNotifications([normalizedAnnouncement, ...prev.all]).slice(0, notificationsPerPage),
        announcements: deduplicateNotifications([normalizedAnnouncement, ...prev.announcements]).slice(0, notificationsPerPage),
      }));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('notificationReceived');
      socket.off('announcementReceived');
    };
  }, []);

  const markAsRead = async (id, isAnnouncement = false) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAnnouncement
        ? `${ANNOUNCEMENT_API_URL}/${id}/mark-read` // Fixed endpoint
        : `/api/notifications/${id}/mark-read`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);

      setNotifications(prev => ({
        ...prev,
        [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: true } : n)),
      }));
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

      setNotifications(prev => ({
        ...prev,
        [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: false } : n)),
      }));
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

      setNotifications(prev => ({
        ...prev,
        [filter]: prev[filter].filter(n => n._id !== notificationId),
      }));
      if (!notifications[filter].find(n => n._id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      const updatedNotifications = notifications[filter].filter(n => n._id !== notificationId);
      if (updatedNotifications.length < notificationsPerPage && pagination[filter].currentPage < pagination[filter].totalPages) {
        setPagination(prev => ({
          ...prev,
          [filter]: { ...prev[filter], currentPage: prev[filter].currentPage + 1 },
        }));
        await fetchNotifications(filter, pagination[filter].currentPage + 1);
      } else {
        await fetchNotifications(filter, pagination[filter].currentPage);
      }
    } catch (error) {
      setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
    }
  };

  const filteredNotifications = notifications[filter].filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'announcements') return notification.type === 'announcement';
    if (filter === 'parking') return notification.type === 'parking_booking' || notification.type === 'parking_cancellation';
    if (filter === 'seating') return notification.type === 'seat_booking' || notification.type === 'seat_cancellation';
    return false;
  });

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LeftSidebar>
      <div className="flex items-center gap-4 ml-8 mt-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        <NotificationBadge isAdmin={false} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                filter={filter}
                setFilter={setFilter}
                currentPage={pagination[filter].currentPage}
                setCurrentPage={(page) => setPagination(prev => ({
                  ...prev,
                  [filter]: { ...prev[filter], currentPage: page },
                }))}
                totalPages={pagination[filter].totalPages}
                isFilterLoading={filterLoading}
              />
              <NotificationList
                notifications={filteredNotifications}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                deleteNotification={deleteNotification}
                error={error}
                unreadCount={unreadCount}
              />
              <PaginationControls
                currentPage={pagination[filter].currentPage}
                setCurrentPage={(page) => setPagination(prev => ({
                  ...prev,
                  [filter]: { ...prev[filter], currentPage: page },
                }))}
                totalPages={pagination[filter].totalPages}
              />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded shadow w-full">
              <NotificationPreferences />
            </div>
            <div className="bg-white p-2 rounded shadow w-full">
              <div className="w-full max-w-[260px] sm:max-w-[300px] transform scale-75 origin-top-left">
                <CalendarCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LeftSidebar>
  );
};

export default UserNotification;