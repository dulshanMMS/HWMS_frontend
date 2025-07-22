// export default UserNotification;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import useAuthGuard from "../components/AuthGuard";
import LeftSidebar from "../components/LeftSidebar";
import CalendarCard from "../components/CalendarCard";
import NotificationFilters from "../components/Notification/NotificationFilters";
import NotificationList from "../components/Notification/NotificationList";
import NotificationPreferences from "../components/Notification/NotificationPreferences";

const API_BASE_URL = '/api/notifications/user/own';
const ANNOUNCEMENT_API_URL = '/api/announcements';

const socket = io('/', { withCredentials: true });

const UserNotification = () => {
  useAuthGuard('user');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const notificationsPerPage = 10;
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Deduplicate notifications by _id and message content
  const deduplicateNotifications = (notifications) => {
    const seen = new Set();
    return notifications.filter(n => {
      const key = `${n._id}-${n.message}`;
      if (seen.has(key)) {
        console.log(`Duplicate notification filtered: ${key}`);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        return;
      }

      // Fetch notifications
      const notificationEndpoint = `${API_BASE_URL}?page=${currentPage}&limit=${notificationsPerPage}&filter=${filter}`;
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

      const notificationData = await notificationResponse.json();
      if (!Array.isArray(notificationData.notifications)) {
        throw new Error('Invalid notification response format');
      }

      // Fetch announcements
      const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${currentPage}&limit=${notificationsPerPage}&filter=${filter}`;
      const announcementResponse = await fetch(announcementEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!announcementResponse.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const announcementData = await announcementResponse.json();
      if (!Array.isArray(announcementData.announcements)) {
        throw new Error('Invalid announcement response format');
      }

      // Normalize announcements
      const normalizedAnnouncements = announcementData.announcements.map(ann => ({
        _id: ann._id,
        message: ann.message,
        type: 'announcement',
        read: false,
        createdAt: ann.createdAt,
        sender: ann.sender,
      }));

      // Merge and deduplicate
      const combinedNotifications = deduplicateNotifications(
        [...notificationData.notifications, ...normalizedAnnouncements]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );

      setNotifications(combinedNotifications);
      setTotalNotifications(notificationData.total + announcementData.total);

      // Fetch unread count
      const unreadResponse = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setUnreadCount(unreadData.count);
      }
    } catch (error) {
      console.error('Error fetching notifications or announcements:', error);
      setError('Failed to fetch notifications or announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, dateRange, currentPage]);

  useEffect(() => {
    const seenNotifications = new Set();

    socket.on('notificationReceived', (notification) => {
      const key = `${notification._id}-${notification.message}`;
      if (seenNotifications.has(key)) {
        console.log(`Duplicate notification received via socket: ${key}`);
        return;
      }
      seenNotifications.add(key);
      setNotifications(prev => deduplicateNotifications([notification, ...prev]));
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
      setNotifications(prev => deduplicateNotifications([normalizedAnnouncement, ...prev]));
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
        ? `${ANNOUNCEMENT_API_URL}/${id}/read`
        : `/api/notifications/${id}/mark-read`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);

      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId).read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'announcements') return notification.type === 'announcement';
    if (filter === 'parking') return notification.message.includes('parking');
    if (filter === 'seating') return notification.message.includes('seat');
    return false;
  });

  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const totalPages = totalNotifications > 0
    ? Math.ceil(totalNotifications / notificationsPerPage)
    : 1;

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view events');
        return;
      }
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setAllEvents(data.events);
        setEventDates(data.events.map(e => e.date));
      } else {
        setError('Invalid events data');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
    }
  };

  const fetchEventsForDate = async (selectedDate) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/events/${formattedDate}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {}
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchEventsForDate(value);
    setShowEventModal(true);
  };

  const handleClearDateRange = () => {
    setDateRange([null, null]);
    setShowClearButton(false);
  };

  const handleApply = () => {
    fetchNotifications();
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LeftSidebar>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-6 ml-8">Notifications</h1>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                filter={filter}
                setFilter={setFilter}
              />
              <NotificationList
                notifications={paginatedNotifications}
                markAsRead={markAsRead}
                markAsUnread={markAsUnread}
                deleteNotification={deleteNotification}
                error={error}
                unreadCount={unreadCount}
              />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded shadow w-full">
              <NotificationPreferences />
            </div>
            <div className="bg-white p-4 rounded shadow w-full">
              <CalendarCard />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded-l-md" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
          <span className="px-4">Page {currentPage} of {totalPages}</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </LeftSidebar>
  );
};

export default UserNotification;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import useAuthGuard from "../components/AuthGuard";
// import LeftSidebar from "../components/LeftSidebar";
// import CalendarCard from "../components/CalendarCard";
// import NotificationFilters from "../components/Notification/NotificationFilters";
// import NotificationList from "../components/Notification/NotificationList";
// import NotificationPreferences from "../components/Notification/NotificationPreferences";

// const API_BASE_URL = '/api/notifications/user/own';
// const ANNOUNCEMENT_API_URL = '/api/announcements';

// const socket = io('/', { withCredentials: true });

// const UserNotification = () => {
//   useAuthGuard('user');
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

//   // Deduplicate notifications by _id and message content
//   const deduplicateNotifications = (notifications) => {
//     const seen = new Set();
//     return notifications.filter(n => {
//       const key = `${n._id}-${n.message}`;
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

//       // Fetch notifications
//       const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filter}`;
//       const notificationResponse = await fetch(notificationEndpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (notificationResponse.status === 401) {
//         localStorage.removeItem('token');
//         navigate('/userdashboard');
//         return;
//       }

//       if (!notificationResponse.ok) {
//         throw new Error('Failed to fetch notifications');
//       }

//       const notificationData = await notificationResponse.json();
//       if (!Array.isArray(notificationData.notifications)) {
//         throw new Error('Invalid notification response format');
//       }

//       // Fetch announcements
//       const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filter}`;
//       const announcementResponse = await fetch(announcementEndpoint, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (!announcementResponse.ok) {
//         throw new Error('Failed to fetch announcements');
//       }

//       const announcementData = await announcementResponse.json();
//       if (!Array.isArray(announcementData.announcements)) {
//         throw new Error('Invalid announcement response format');
//       }

//       // Normalize announcements
//       const normalizedAnnouncements = announcementData.announcements.map(ann => ({
//         _id: ann._id,
//         message: ann.message,
//         type: 'announcement',
//         read: false,
//         createdAt: ann.createdAt,
//         sender: ann.sender,
//       }));

//       // Merge and deduplicate
//       const combinedNotifications = deduplicateNotifications(
//         [...notificationData.notifications, ...normalizedAnnouncements]
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       );

//       setNotifications(combinedNotifications);
//       setTotalNotifications(notificationData.total + announcementData.total);

//       // Fetch unread count
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
//     fetchNotifications();
//   }, [filter, dateRange, currentPage]);

//   useEffect(() => {
//     const seenNotifications = new Set();

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
//       setTotalNotifications(prev => Math.max(0, prev - 1));
      
//       if (!notifications.find(n => n._id === notificationId).read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }

//       // Fetch additional notifications to maintain 10 per page
//       if (notifications.length <= notificationsPerPage && totalNotifications > notifications.length) {
//         const nextPage = Math.ceil((notifications.length + 1) / notificationsPerPage);
//         await fetchNotifications(nextPage);
//       }
//     } catch (error) {
//       setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
//     }
//   };

//   const filteredNotifications = notifications.filter(notification => {
//     const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
//     if (!matchesSearch) return false;

//     if (filter === 'all') return true;
//     if (filter === 'announcements') return notification.type === 'announcement';
//     if (filter === 'parking') return notification.message.includes('parking');
//     if (filter === 'seating') return notification.message.includes('seat');
//     return false;
//   });

//   const paginatedNotifications = filteredNotifications.slice(
//     (currentPage - 1) * notificationsPerPage,
//     currentPage * notificationsPerPage
//   );

//   const totalPages = totalNotifications > 0
//     ? Math.ceil(totalNotifications / notificationsPerPage)
//     : 1;

//   const fetchAllEvents = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Please log in to view events');
//         return;
//       }
//       const res = await fetch('/api/events', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.events)) {
//         setAllEvents(data.events);
//         setEventDates(data.events.map(e => e.date));
//       } else {
//         setError('Invalid events data');
//       }
//     } catch (err) {
//       console.error('Error fetching events:', err);
//       setError('Failed to fetch events');
//     }
//   };

//   const fetchEventsForDate = async (selectedDate) => {
//     try {
//       const formattedDate = selectedDate.toISOString().split('T')[0];
//       const res = await fetch(`/api/events/${formattedDate}`);
//       const data = await res.json();
//       if (data.success) {
//         setEvents(data.events);
//       }
//     } catch (err) {}
//   };

//   const handleDayClick = (value) => {
//     setDate(value);
//     fetchEventsForDate(value);
//     setShowEventModal(true);
//   };

//   const handleClearDateRange = () => {
//     setDateRange([null, null]);
//     setShowClearButton(false);
//   };

//   const handleApply = () => {
//     fetchNotifications();
//   };

//   useEffect(() => {
//     fetchAllEvents();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <LeftSidebar>
//       <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-6 ml-8">Notifications</h1>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
//             </div>
//           </div>
//           <div className="lg:col-span-1 flex flex-col gap-4">
//             <div className="bg-white p-4 rounded shadow w-full">
//               <NotificationPreferences />
//             </div>
//             <div className="bg-white p-4 rounded shadow w-full">
//               <CalendarCard />
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-center items-center mt-4">
//           <button className="px-4 py-2 bg-gray-300 rounded-l-md" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
//             Previous
//           </button>
//           <span className="px-4">Page {currentPage} of {totalPages}</span>
//           <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
//             Next
//           </button>
//         </div>
//       </div>
//     </LeftSidebar>
//   );
// };

// export default UserNotification;