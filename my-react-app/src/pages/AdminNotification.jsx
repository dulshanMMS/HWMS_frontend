//mark as read button 2k thiye
// import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { debounce } from 'lodash';
// import AdminSidebar from '../components/AdminSidebar';
// import useAuthGuard from '../components/AuthGuard';
// import EventCalendar from '../components/AdminDashboard/EventCalendar';
// import NotificationFilters from '../components/Notification/NotificationFilters';
// import NotificationList from '../components/Notification/NotificationList';
// import NotificationPreferences from '../components/Notification/NotificationPreferences';
// import NotificationBadge from '../components/Notification/NotificationBadge';
// import PaginationControls from '../components/Notification/PaginationControls';

// const API_BASE_URL = '/api/notifications/admin/own';
// const ANNOUNCEMENT_API_URL = '/api/announcements';

// const socket = io('/', { withCredentials: true });

// const AdminNotification = () => {
//   useAuthGuard('admin');
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState({
//     all: [],
//     announcements: [],
//     parking: [],
//     seating: [],
//   });
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [filterLoading, setFilterLoading] = useState(false);
//   const [filter, setFilter] = useState('all');
//   const [error, setError] = useState(null);
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [date, setDate] = useState(new Date());
//   const [allEvents, setAllEvents] = useState([]);
//   const [eventDates, setEventDates] = useState([]);
//   const [showEventModal, setShowEventModal] = useState(false);
//   const [events, setEvents] = useState([]);
//   const [pagination, setPagination] = useState({
//     all: { currentPage: 1, totalPages: 1 },
//     announcements: { currentPage: 1, totalPages: 1 },
//     parking: { currentPage: 1, totalPages: 1 },
//     seating: { currentPage: 1, totalPages: 1 },
//   });
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
//   const [isDeletingAll, setIsDeletingAll] = useState(false);
//   const [showDeleteAllSuccess, setShowDeleteAllSuccess] = useState(false);
//   const deleteAllButtonRef = useRef(null);
//   const notificationsPerPage = 10;
//   const [allRead, setAllRead] = useState(false);

//   const notificationCache = useMemo(() => new Map(), []);

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

//   const fetchNotifications = useCallback(
//     debounce(async (filterType, page = 1) => {
//       console.log(`Fetching notifications for filter: ${filterType}, page: ${page}`);
//       const cacheKey = `${filterType}-${page}`;
//       console.log('Cache contents:', Array.from(notificationCache.entries()));
//       if (notificationCache.has(cacheKey)) {
//         console.log(`Cache hit for ${cacheKey}`);
//         const { notifications: cachedNotifications, total } = notificationCache.get(cacheKey);
//         setNotifications(prev => ({ ...prev, [filterType]: cachedNotifications }));
//         setPagination(prev => ({
//           ...prev,
//           [filterType]: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / notificationsPerPage)) },
//         }));
//         setFilterLoading(false);
//         setInitialLoading(false);
//         console.log(`Notifications for ${filterType}:`, cachedNotifications);
//         return;
//       }

//       try {
//         setFilterLoading(true);
//         setError(null);
//         const token = localStorage.getItem('token');
//         if (!token) {
//           setError('Please log in to view notifications');
//           return;
//         }

//         let notificationData = { notifications: [], total: 0 };
//         let announcementData = { announcements: [], total: 0 };
//         let totalNotifications = 0;

//         if (filterType === 'all' || filterType === 'parking' || filterType === 'seating') {
//           const notificationEndpoint = `${API_BASE_URL}?page=${page}&limit=${notificationsPerPage}&filter=${filterType}`;
//           console.log(`Fetching notifications: ${notificationEndpoint}`);
//           const notificationResponse = await fetch(notificationEndpoint, {
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           if (notificationResponse.status === 401 || notificationResponse.status === 403) {
//             console.error('Authentication error:', notificationResponse.status);
//             localStorage.removeItem('token');
//             navigate('/');
//             return;
//           }

//           if (!notificationResponse.ok) {
//             const errorText = await notificationResponse.text();
//             throw new Error(`Failed to fetch notifications: ${errorText}`);
//           }

//           notificationData = await notificationResponse.json();
//           if (!Array.isArray(notificationData.notifications)) {
//             throw new Error('Invalid notification response format');
//           }
//           totalNotifications += notificationData.total;
//           console.log(`Fetched ${notificationData.notifications.length} notifications for ${filterType}`);
//         }

//         if (filterType === 'all' || filterType === 'announcements') {
//           const announcementEndpoint = `${ANNOUNCEMENT_API_URL}?page=${page}&limit=${notificationsPerPage}`;
//           console.log(`Fetching announcements: ${announcementEndpoint}`);
//           const announcementResponse = await fetch(announcementEndpoint, {
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           if (!announcementResponse.ok) {
//             const errorText = await announcementResponse.text();
//             throw new Error(`Failed to fetch announcements: ${errorText}`);
//           }

//           announcementData = await announcementResponse.json();
//           if (!Array.isArray(announcementData.announcements)) {
//             throw new Error('Invalid announcement response format');
//           }
//           totalNotifications += announcementData.total;
//           console.log(`Fetched ${announcementData.announcements.length} announcements`);
//         }

//         const normalizedAnnouncements = announcementData.announcements
//           ? announcementData.announcements.map(ann => ({
//               _id: ann._id,
//               message: ann.message,
//               type: 'announcement',
//               read: ann.read || false,
//               createdAt: ann.createdAt,
//               sender: ann.sender,
//               category: 'announcement',
//             }))
//           : [];

//         const combinedNotifications = deduplicateNotifications(
//           [...(notificationData.notifications || []), ...normalizedAnnouncements]
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//             .slice(0, notificationsPerPage)
//         );

//         notificationCache.set(cacheKey, { notifications: combinedNotifications, total: totalNotifications });
//         setNotifications(prev => ({
//           ...prev,
//           [filterType]: combinedNotifications,
//         }));
//         setPagination(prev => ({
//           ...prev,
//           [filterType]: {
//             currentPage: page,
//             totalPages: Math.max(1, Math.ceil(totalNotifications / notificationsPerPage)),
//           },
//         }));
//         console.log(`Stored ${combinedNotifications.length} notifications for ${filterType} in cache`);

//         const unreadResponse = await fetch('/api/notifications/admin/unread-count', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (unreadResponse.ok) {
//           const unreadData = await unreadResponse.json();
//           setUnreadCount(unreadData.count);
//           console.log(`Unread count: ${unreadData.count}`);
//         } else {
//           throw new Error('Failed to fetch unread count');
//         }
//       } catch (error) {
//         console.error('Error fetching notifications or announcements:', error);
//         setError('Failed to fetch notifications or announcements');
//       } finally {
//         setFilterLoading(false);
//         setInitialLoading(false);
//       }
//     }, 300),
//     [navigate, notificationCache]
//   );
  
//   useEffect(() => {
//   const allNotificationsRead = notifications[filter].length > 0 && notifications[filter].every(n => n.read);
//   setAllRead(allNotificationsRead);
//   }, [notifications, filter]);
  
//   useEffect(() => {
//     console.log(`Switching to filter: ${filter}`);
//     notificationCache.delete(`${filter}-${pagination[filter].currentPage}`);
//     fetchNotifications(filter, pagination[filter].currentPage);
//   }, [filter, pagination[filter].currentPage, fetchNotifications]);

//   useEffect(() => {
//     const seenNotifications = new Set();

//     socket.on('notificationReceived', (notification) => {
//       console.log('Received socket notification:', notification);
//       const key = `${notification._id}-${notification.message}`;
//       if (seenNotifications.has(key)) {
//         console.log(`Duplicate notification received via socket: ${key}`);
//         return;
//       }
//       seenNotifications.add(key);
//       setNotifications(prev => {
//         const updated = {
//           ...prev,
//           all: deduplicateNotifications([notification, ...prev.all]).slice(0, notificationsPerPage),
//           [notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']: deduplicateNotifications([notification, ...prev[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']]).slice(0, notificationsPerPage),
//         };
//         notificationCache.delete(`all-${pagination.all.currentPage}`);
//         notificationCache.delete(`${notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all'}-${pagination[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all'].currentPage}`);
//         console.log(`Updated notifications for ${notification.category}:`, updated[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']);
//         return updated;
//       });
//       setUnreadCount(prev => prev + 1);
//     });

//     socket.on('announcementReceived', (announcement) => {
//       console.log('Received socket announcement:', announcement);
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
//         category: 'announcement',
//       };
//       setNotifications(prev => {
//         const updated = {
//           ...prev,
//           all: deduplicateNotifications([normalizedAnnouncement, ...prev.all]).slice(0, notificationsPerPage),
//           announcements: deduplicateNotifications([normalizedAnnouncement, ...prev.announcements]).slice(0, notificationsPerPage),
//         };
//         notificationCache.delete(`all-${pagination.all.currentPage}`);
//         notificationCache.delete(`announcements-${pagination.announcements.currentPage}`);
//         console.log('Updated announcements:', updated.announcements);
//         return updated;
//       });
//       setUnreadCount(prev => prev + 1);
//     });

//     return () => {
//       socket.off('notificationReceived');
//       socket.off('announcementReceived');
//     };
//   }, [notificationCache, pagination]);

//   const markAsRead = async (id, isAnnouncement = false) => {
//     try {
//       const token = localStorage.getItem('token');
//       const endpoint = isAnnouncement
//         ? `${ANNOUNCEMENT_API_URL}/${id}/mark-read`
//         : `/api/notifications/${id}/mark-read`;
//       const response = await fetch(endpoint, {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as read`);

//       setNotifications(prev => {
//         const updated = {
//           ...prev,
//           [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: true } : n)),
//         };
//         const cacheKey = `${filter}-${pagination[filter].currentPage}`;
//         if (notificationCache.has(cacheKey)) {
//           const cached = notificationCache.get(cacheKey);
//           notificationCache.set(cacheKey, {
//             ...cached,
//             notifications: cached.notifications.map(n => (n._id === id ? { ...n, read: true } : n)),
//           });
//         }
//         return updated;
//       });
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
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);

//       setNotifications(prev => {
//         const updated = {
//           ...prev,
//           [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: false } : n)),
//         };
//         const cacheKey = `${filter}-${pagination[filter].currentPage}`;
//         if (notificationCache.has(cacheKey)) {
//           const cached = notificationCache.get(cacheKey);
//           notificationCache.set(cacheKey, {
//             ...cached,
//             notifications: cached.notifications.map(n => (n._id === id ? { ...n, read: false } : n)),
//           });
//         }
//         return updated;
//       });
//       setUnreadCount(prev => prev + 1);
//     } catch (error) {
//       setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/notifications/mark-all-read', {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error('Failed to mark all notifications as read');

//       setNotifications(prev => {
//         const updated = { ...prev };
//         Object.keys(updated).forEach(key => {
//           updated[key] = prev[key].map(n => ({ ...n, read: true }));
//         });
//         Object.keys(notificationCache).forEach(cacheKey => {
//           const cached = notificationCache.get(cacheKey);
//           notificationCache.set(cacheKey, {
//             ...cached,
//             notifications: cached.notifications.map(n => ({ ...n, read: true })),
//           });
//         });
//         return updated;
//       });
//       setUnreadCount(0);
//     } catch (error) {
//       setError('Failed to mark all notifications as read');
//     }
//   };

//   const markAllAsUnread = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/notifications/mark-all-unread', {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error('Failed to mark all notifications as unread');

//       setNotifications(prev => {
//         const updated = { ...prev };
//         Object.keys(updated).forEach(key => {
//           updated[key] = prev[key].map(n => ({ ...n, read: false }));
//         });
//         Object.keys(notificationCache).forEach(cacheKey => {
//           const cached = notificationCache.get(cacheKey);
//           notificationCache.set(cacheKey, {
//             ...cached,
//             notifications: cached.notifications.map(n => ({ ...n, read: false })),
//           });
//         });
//         return updated;
//       });
//       setUnreadCount(prev => prev + notifications[filter].length);
//     } catch (error) {
//       setError('Failed to mark all notifications as unread');
//     }
//   };

//   const deleteAllNotifications = async () => {
//     try {
//       setIsDeletingAll(true);
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/notifications/delete-all', {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error('Failed to delete all notifications');

//       setNotifications(prev => {
//         const updated = { ...prev, [filter]: [] };
//         const cacheKey = `${filter}-${pagination[filter].currentPage}`;
//         if (notificationCache.has(cacheKey)) {
//           notificationCache.set(cacheKey, { notifications: [], total: 0 });
//         }
//         return updated;
//       });
//       setUnreadCount(0);
//       setShowDeleteAllSuccess(true);
//       setTimeout(() => setShowDeleteAllSuccess(false), 5000); // Show success for 5 seconds
//     } catch (error) {
//       setError('Failed to delete all notifications');
//     } finally {
//       setIsDeletingAll(false);
//       setShowDeleteAllConfirm(false);
//     }
//   };

  
 
 
   
//   const undoDeleteAll = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/notifications/mark-all-unread', {
//         method: 'PUT',
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error('Failed to undo delete all notifications');

//       await fetchNotifications(filter, pagination[filter].currentPage);
//       setShowDeleteAllSuccess(false);
//     } catch (error) {
//       setError('Failed to undo delete all notifications');
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
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);

//       setNotifications(prev => {
//         const updated = {
//           ...prev,
//           [filter]: prev[filter].filter(n => n._id !== notificationId),
//         };
//         const cacheKey = `${filter}-${pagination[filter].currentPage}`;
//         if (notificationCache.has(cacheKey)) {
//           const cached = notificationCache.get(cacheKey);
//           notificationCache.set(cacheKey, {
//             ...cached,
//             notifications: cached.notifications.filter(n => n._id !== notificationId),
//             total: cached.total - 1,
//           });
//         }
//         return updated;
//       });
//       if (!notifications[filter].find(n => n._id === notificationId)?.read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }

//       const updatedNotifications = notifications[filter].filter(n => n._id !== notificationId);
//       if (updatedNotifications.length < notificationsPerPage && pagination[filter].currentPage < pagination[filter].totalPages) {
//         setPagination(prev => ({
//           ...prev,
//           [filter]: { ...prev[filter], currentPage: prev[filter].currentPage + 1 },
//         }));
//       } else {
//         await fetchNotifications(filter, pagination[filter].currentPage);
//       }
//     } catch (error) {
//       setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (deleteAllButtonRef.current && !deleteAllButtonRef.current.contains(event.target)) {
//         setShowDeleteAllConfirm(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const filteredNotifications = notifications[filter].filter(notification => {
//     if (filter === 'all') return true;
//     if (filter === 'announcements') return notification.type === 'announcement';
//     if (filter === 'parking') return notification.type === 'parking_booking' || notification.type === 'parking_cancellation';
//     if (filter === 'seating') return notification.type === 'seat_booking' || notification.type === 'seat_cancellation';
//     return false;
//   });

//   console.log(`Rendering notifications for filter ${filter}:`, filteredNotifications);

//   if (initialLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <AdminSidebar>
//       <div className="flex items-center justify-between ml-8 mt-6">
//     <div className="flex items-center gap-4">
//       <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
//       <NotificationBadge isAdmin={true} />
//     </div>
//     <div className="flex gap-2 mr-8">
//       <button
//         onClick={allRead ? markAllAsUnread : markAllAsRead}
//         className={`px-3 py-1 text-sm font-semibold rounded-lg border shadow ${
//           allRead
//             ? 'bg-green-60 text-green-800 border-green-200 hover:bg-green-200'
//             : 'bg-green-700 text-white border-green-700 hover:bg-green-900'
//         }`}
//       >
//         {allRead ? 'Mark All as Unread' : 'Mark All as Read'}
//       </button>
//       <button
//         onClick={() => setShowDeleteAllConfirm(true)}
//         className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-lg border border-red-600 shadow hover:bg-red-800"
//       >
//         Delete All
//       </button>
//     </div>
//   </div>
//       {showDeleteAllConfirm && (
//         <div
//           className="absolute top-20 right-8 bg-white border border-gray-200 rounded shadow-lg p-3 text-sm z-20"
//           ref={deleteAllButtonRef}
//         >
//           <p>Delete all notifications?</p>
//           <div className="flex gap-2 mt-2">
//             <button
//               onClick={deleteAllNotifications}
//               className="px-2 py-1 bg-red-400 text-white rounded text-xs"
//             >
//               OK
//             </button>
//             <button
//               onClick={() => setShowDeleteAllConfirm(false)}
//               className="px-2 py-1 bg-gray-300 rounded text-xs"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//       {isDeletingAll && (
//         <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
//           <div className="p-4 bg-white rounded-lg shadow-md text-sm">
//             <div className="flex items-center gap-2">
//               <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
//               <span>Deleting all notifications...</span>
//             </div>
//           </div>
//         </div>
//       )}
//       {showDeleteAllSuccess && (
//         <div className="p-2 mb-2 bg-green-100 text-green-800 rounded mx-8">
//           All notifications deleted successfully!
//           <button
//             onClick={undoDeleteAll}
//             className="ml-2 text-blue-600 hover:underline"
//           >
//             Undo
//           </button>
//         </div>
//       )}
//       {error && (
//         <div className="p-2 mb-2 bg-red-100 text-red-800 rounded mx-8">
//           {error}
//         </div>
//       )}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-md">
//               <NotificationFilters
//                 filter={filter}
//                 setFilter={setFilter}
//                 currentPage={pagination[filter].currentPage}
//                 setCurrentPage={(page) => {
//                   console.log('Setting page for filter', filter, 'to', page);
//                   setPagination(prev => ({
//                     ...prev,
//                     [filter]: { ...prev[filter], currentPage: Number(page) },
//                   }));
//                 }}
//                 totalPages={pagination[filter].totalPages}
//                 isFilterLoading={filterLoading}
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
//                 setCurrentPage={(page) => {
//                   console.log('PaginationControls setCurrentPage:', page);
//                   setPagination(prev => ({
//                     ...prev,
//                     [filter]: { ...prev[filter], currentPage: Number(page) },
//                   }));
//                 }}
//                 totalPages={pagination[filter].totalPages}
//                 isLoading={filterLoading}
//               />
//             </div>
//           </div>
//           <div className="lg:col-span-1 flex flex-col gap-4">
//             <div className="bg-white p-4 rounded shadow w-full">
//               <NotificationPreferences />
//             </div>
//             <div className="bg-white p-2 rounded shadow w-full">
//               <div className="w-full max-w-[260px] sm:max-w-[300px] transform  origin-top-left">
//                 <EventCalendar
//                 date={date}
//                setDate={setDate}
//                eventDates={eventDates || []}               
//                todayEvents={events || []}             
//                />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminSidebar>
//   );
// };

// export default AdminNotification;




import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { debounce } from 'lodash';
import AdminSidebar from '../components/AdminSidebar';
import useAuthGuard from '../components/AuthGuard';
import EventCalendar from '../components/AdminDashboard/EventCalendar';
import NotificationFilters from '../components/Notification/NotificationFilters';
import NotificationList from '../components/Notification/NotificationList';
import NotificationPreferences from '../components/Notification/NotificationPreferences';
import NotificationBadge from '../components/Notification/NotificationBadge';
import PaginationControls from '../components/Notification/PaginationControls';

const API_BASE_URL = '/api/notifications/admin/own';
const ANNOUNCEMENT_API_URL = '/api/announcements';

const socket = io('/', { withCredentials: true });

const AdminNotification = () => {
  useAuthGuard('admin');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    all: [],
    announcements: [],
    parking: [],
    seating: [],
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [date, setDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    all: { currentPage: 1, totalPages: 1 },
    announcements: { currentPage: 1, totalPages: 1 },
    parking: { currentPage: 1, totalPages: 1 },
    seating: { currentPage: 1, totalPages: 1 },
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllSuccess, setShowDeleteAllSuccess] = useState(false);
  const deleteAllButtonRef = useRef(null);
  const notificationsPerPage = 10;
  const [allRead, setAllRead] = useState(false);

  const notificationCache = useMemo(() => new Map(), []);

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
      console.log(`Fetching notifications for filter: ${filterType}, page: ${page}`);
      const cacheKey = `${filterType}-${page}`;
      console.log('Cache contents:', Array.from(notificationCache.entries()));
      if (notificationCache.has(cacheKey)) {
        console.log(`Cache hit for ${cacheKey}`);
        const { notifications: cachedNotifications, total } = notificationCache.get(cacheKey);
        setNotifications(prev => ({ ...prev, [filterType]: cachedNotifications }));
        setPagination(prev => ({
          ...prev,
          [filterType]: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / notificationsPerPage)) },
        }));
        setFilterLoading(false);
        setInitialLoading(false);
        console.log(`Notifications for ${filterType}:`, cachedNotifications);
        return;
      }

      try {
        setFilterLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view notifications');
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
          totalNotifications += notificationData.total;
          console.log(`Fetched ${notificationData.notifications.length} notifications for ${filterType}`);
        }

        if (filterType === 'all' || filterType === 'announcements') {
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
          totalNotifications += announcementData.total;
          console.log(`Fetched ${announcementData.announcements.length} announcements`);
        }

        const normalizedAnnouncements = announcementData.announcements
          ? announcementData.announcements.map(ann => ({
              _id: ann._id,
              message: ann.message,
              type: 'announcement',
              read: ann.read || false,
              createdAt: ann.createdAt,
              sender: ann.sender,
              category: 'announcement',
            }))
          : [];

        const combinedNotifications = deduplicateNotifications(
          [...(notificationData.notifications || []), ...normalizedAnnouncements]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, notificationsPerPage)
        );

        notificationCache.set(cacheKey, { notifications: combinedNotifications, total: totalNotifications });
        setNotifications(prev => ({
          ...prev,
          [filterType]: combinedNotifications,
        }));
        setPagination(prev => ({
          ...prev,
          [filterType]: {
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(totalNotifications / notificationsPerPage)),
          },
        }));
        console.log(`Stored ${combinedNotifications.length} notifications for ${filterType} in cache`);

        const unreadResponse = await fetch('/api/notifications/admin/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json();
          setUnreadCount(unreadData.count);
          console.log(`Unread count: ${unreadData.count}`);
        } else {
          throw new Error('Failed to fetch unread count');
        }
      } catch (error) {
        console.error('Error fetching notifications or announcements:', error);
        setError('Failed to fetch notifications or announcements');
      } finally {
        setFilterLoading(false);
        setInitialLoading(false);
      }
    }, 300),
    [navigate, notificationCache]
  );

  useEffect(() => {
    const allNotificationsRead = notifications[filter].length > 0 && notifications[filter].every(n => n.read);
    setAllRead(allNotificationsRead);
  }, [notifications, filter]);

  useEffect(() => {
    console.log(`Switching to filter: ${filter}`);
    notificationCache.delete(`${filter}-${pagination[filter].currentPage}`);
    fetchNotifications(filter, pagination[filter].currentPage);
  }, [filter, pagination[filter].currentPage, fetchNotifications]);

  useEffect(() => {
    const seenNotifications = new Set();

    socket.on('notificationReceived', (notification) => {
      console.log('Received socket notification:', notification);
      const key = `${notification._id}-${notification.message}`;
      if (seenNotifications.has(key)) {
        console.log(`Duplicate notification received via socket: ${key}`);
        return;
      }
      seenNotifications.add(key);
      setNotifications(prev => {
        const updated = {
          ...prev,
          all: deduplicateNotifications([notification, ...prev.all]).slice(0, notificationsPerPage),
          [notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']: deduplicateNotifications([notification, ...prev[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']]).slice(0, notificationsPerPage),
        };
        notificationCache.delete(`all-${pagination.all.currentPage}`);
        notificationCache.delete(`${notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all'}-${pagination[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all'].currentPage}`);
        console.log(`Updated notifications for ${notification.category}:`, updated[notification.category === 'parking' ? 'parking' : notification.category === 'seating' ? 'seating' : 'all']);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    });

    socket.on('announcementReceived', (announcement) => {
      console.log('Received socket announcement:', announcement);
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
        category: 'announcement',
      };
      setNotifications(prev => {
        const updated = {
          ...prev,
          all: deduplicateNotifications([normalizedAnnouncement, ...prev.all]).slice(0, notificationsPerPage),
          announcements: deduplicateNotifications([normalizedAnnouncement, ...prev.announcements]).slice(0, notificationsPerPage),
        };
        notificationCache.delete(`all-${pagination.all.currentPage}`);
        notificationCache.delete(`announcements-${pagination.announcements.currentPage}`);
        console.log('Updated announcements:', updated.announcements);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    });

    return () => {
      socket.off('notificationReceived');
      socket.off('announcementReceived');
    };
  }, [notificationCache, pagination]);

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

      setNotifications(prev => {
        const updated = {
          ...prev,
          [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: true } : n)),
        };
        const cacheKey = `${filter}-${pagination[filter].currentPage}`;
        if (notificationCache.has(cacheKey)) {
          const cached = notificationCache.get(cacheKey);
          notificationCache.set(cacheKey, {
            ...cached,
            notifications: cached.notifications.map(n => (n._id === id ? { ...n, read: true } : n)),
          });
        }
        return updated;
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
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

      setNotifications(prev => {
        const updated = {
          ...prev,
          [filter]: prev[filter].map(n => (n._id === id ? { ...n, read: false } : n)),
        };
        const cacheKey = `${filter}-${pagination[filter].currentPage}`;
        if (notificationCache.has(cacheKey)) {
          const cached = notificationCache.get(cacheKey);
          notificationCache.set(cacheKey, {
            ...cached,
            notifications: cached.notifications.map(n => (n._id === id ? { ...n, read: false } : n)),
          });
        }
        return updated;
      });
      setUnreadCount(prev => prev + 1);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError(`Failed to mark ${isAnnouncement ? 'announcement' : 'notification'} as unread`);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');

      setNotifications(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = prev[key].map(n => ({ ...n, read: true }));
        });
        Object.keys(notificationCache).forEach(cacheKey => {
          const cached = notificationCache.get(cacheKey);
          notificationCache.set(cacheKey, {
            ...cached,
            notifications: cached.notifications.map(n => ({ ...n, read: true })),
          });
        });
        return updated;
      });
      setUnreadCount(0);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError('Failed to mark all notifications as read');
    }
  };

  const markAllAsUnread = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-unread', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as unread');

      setNotifications(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = prev[key].map(n => ({ ...n, read: false }));
        });
        Object.keys(notificationCache).forEach(cacheKey => {
          const cached = notificationCache.get(cacheKey);
          notificationCache.set(cacheKey, {
            ...cached,
            notifications: cached.notifications.map(n => ({ ...n, read: false })),
          });
        });
        return updated;
      });
      setUnreadCount(prev => prev + notifications[filter].length);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError('Failed to mark all notifications as unread');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setIsDeletingAll(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete all notifications');

      setNotifications(prev => {
        const updated = { ...prev, [filter]: [] };
        const cacheKey = `${filter}-${pagination[filter].currentPage}`;
        if (notificationCache.has(cacheKey)) {
          notificationCache.set(cacheKey, { notifications: [], total: 0 });
        }
        return updated;
      });
      setUnreadCount(0);
      setShowDeleteAllSuccess(true);
      setTimeout(() => setShowDeleteAllSuccess(false), 5000); // Show success for 5 seconds
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError('Failed to delete all notifications');
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllConfirm(false);
    }
  };

  const undoDeleteAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-unread', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to undo delete all notifications');

      await fetchNotifications(filter, pagination[filter].currentPage);
      setShowDeleteAllSuccess(false);
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError('Failed to undo delete all notifications');
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

      setNotifications(prev => {
        const updated = {
          ...prev,
          [filter]: prev[filter].filter(n => n._id !== notificationId),
        };
        const cacheKey = `${filter}-${pagination[filter].currentPage}`;
        if (notificationCache.has(cacheKey)) {
          const cached = notificationCache.get(cacheKey);
          notificationCache.set(cacheKey, {
            ...cached,
            notifications: cached.notifications.filter(n => n._id !== notificationId),
            total: cached.total - 1,
          });
        }
        return updated;
      });
      if (!notifications[filter].find(n => n._id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      const updatedNotifications = notifications[filter].filter(n => n._id !== notificationId);
      if (updatedNotifications.length < notificationsPerPage && pagination[filter].currentPage < pagination[filter].totalPages) {
        setPagination(prev => ({
          ...prev,
          [filter]: { ...prev[filter], currentPage: prev[filter].currentPage + 1 },
        }));
      } else {
        await fetchNotifications(filter, pagination[filter].currentPage);
      }
      window.dispatchEvent(new Event('notification-updated')); // Trigger sidebar update
    } catch (error) {
      setError(`Failed to delete ${isAnnouncement ? 'announcement' : 'notification'}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteAllButtonRef.current && !deleteAllButtonRef.current.contains(event.target)) {
        setShowDeleteAllConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredNotifications = notifications[filter].filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'announcements') return notification.type === 'announcement';
    if (filter === 'parking') return notification.type === 'parking_booking' || notification.type === 'parking_cancellation';
    if (filter === 'seating') return notification.type === 'seat_booking' || notification.type === 'seat_cancellation';
    return false;
  });

  console.log(`Rendering notifications for filter ${filter}:`, filteredNotifications);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex items-center justify-between ml-8 mt-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
          <NotificationBadge isAdmin={true} />
        </div>
        <div className="flex gap-2 mr-8">
          <button
            onClick={allRead ? markAllAsUnread : markAllAsRead}
            className={`px-3 py-1 text-sm font-semibold rounded-lg border shadow ${
              allRead
                ? 'bg-green-60 text-green-800 border-green-200 hover:bg-green-200'
                : 'bg-green-700 text-white border-green-700 hover:bg-green-900'
            }`}
          >
            {allRead ? 'Mark All as Unread' : 'Mark All as Read'}
          </button>
          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            className="px-3 py-1 text-sm font-semibold bg-red-600 text-white rounded-lg border border-red-600 shadow hover:bg-red-800"
          >
            Delete All
          </button>
        </div>
      </div>
      {showDeleteAllConfirm && (
        <div
          className="absolute top-20 right-8 bg-white border border-gray-200 rounded shadow-lg p-3 text-sm z-20"
          ref={deleteAllButtonRef}
        >
          <p>Delete all notifications?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={deleteAllNotifications}
              className="px-2 py-1 bg-red-400 text-white rounded text-xs"
            >
              OK
            </button>
            <button
              onClick={() => setShowDeleteAllConfirm(false)}
              className="px-2 py-1 bg-gray-300 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {isDeletingAll && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
          <div className="p-4 bg-white rounded-lg shadow-md text-sm">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
              <span>Deleting all notifications...</span>
            </div>
          </div>
        </div>
      )}
      {showDeleteAllSuccess && (
        <div className="p-2 mb-2 bg-green-100 text-green-800 rounded mx-8">
          All notifications deleted successfully!
          <button
            onClick={undoDeleteAll}
            className="ml-2 text-blue-600 hover:underline"
          >
            Undo
          </button>
        </div>
      )}
      {error && (
        <div className="p-2 mb-2 bg-red-100 text-red-800 rounded mx-8">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <NotificationFilters
                filter={filter}
                setFilter={setFilter}
                currentPage={pagination[filter].currentPage}
                setCurrentPage={(page) => {
                  console.log('Setting page for filter', filter, 'to', page);
                  setPagination(prev => ({
                    ...prev,
                    [filter]: { ...prev[filter], currentPage: Number(page) },
                  }));
                }}
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
                setCurrentPage={(page) => {
                  console.log('PaginationControls setCurrentPage:', page);
                  setPagination(prev => ({
                    ...prev,
                    [filter]: { ...prev[filter], currentPage: Number(page) },
                  }));
                }}
                totalPages={pagination[filter].totalPages}
                isLoading={filterLoading}
              />
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white p-4 rounded shadow w-full">
              <NotificationPreferences />
            </div>
            <div className="bg-white p-2 rounded shadow w-full">
              <div className="w-full max-w-[260px] sm:max-w-[300px] transform origin-top-left">
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
      </div>
    </AdminSidebar>
  );
};

export default AdminNotification;








