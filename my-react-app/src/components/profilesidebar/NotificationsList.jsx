
import React, { useState, useEffect } from "react";
import { FiChevronRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { 
  FaCar, 
  FaChair, 
  FaMapMarkerAlt, 
  FaBullhorn, 
  FaCalendarAlt,
  FaEnvelope,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const NotificationsList = ({
  todayBookings = [],
  upcomingBooking = null,
  userNotifications = [],
}) => {

  const navigate = useNavigate();
  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);
  
  // UI state for collapsible sections
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    bookingReminders: false,
    announcements: false,
    messages: false,
    upcoming: false
  });

  // Show/hide read announcements
  const [showReadAnnouncements, setShowReadAnnouncements] = useState(false);

  const count = todayBookings.length;

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [showReadAnnouncements]);

  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setAnnouncementsError("Authentication required");
        return;
      }

      // Use your existing announcement route
      const response = await axios.get(
        `http://localhost:5000/api/announcements?page=1&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAnnouncements(response.data.announcements || []);
      setAnnouncementsError(null);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncementsError("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Toggle section collapse
  const toggleSection = (section) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format time for announcements
  const formatAnnouncementTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  // Mark announcement as read (using your existing route)
  const markAnnouncementAsRead = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/announcements/${announcementId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === announcementId ? { ...ann, read: true } : ann
        )
      );
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  // Delete announcement (using your existing route)
  const deleteAnnouncement = async (announcementId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/announcements/${announcementId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from local state
      setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  // Filter announcements based on read status
  const filteredAnnouncements = showReadAnnouncements 
    ? announcements 
    : announcements.filter(ann => !ann.read);

  // Collapsible Section Header Component
  const SectionHeader = ({ 
    title, 
    count, 
    icon, 
    color, 
    sectionKey, 
    showActions = false,
    onAction = null,
    actionIcon = null,
    actionTitle = ""
  }) => (
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center gap-2 flex-1 text-left group"
      >
        <div className={`p-2 rounded-lg ${color} transition-all duration-200 group-hover:scale-110 shadow-sm`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
            {title} {count !== undefined && `(${count})`}
          </h4>
        </div>
        <div className="transition-transform duration-200">
          {sectionsCollapsed[sectionKey] ? 
            <FiChevronDown className="text-gray-400" /> : 
            <FiChevronUp className="text-gray-400" />
          }
        </div>
      </button>
      
      {showActions && onAction && (
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onAction}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
            title={actionTitle}
          >
            {actionIcon}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-2 space-y-4">
      {/* Main Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent">
          Notifications
        </h3>
        <button 
  onClick={() => {
    navigate('/user/notifications');
  }}
  className="bg-gradient-to-r from-green-500 to-green-400 text-white text-sm font-medium py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
>
  View All <FiChevronRight />
</button>
            </div>

      {/* Booking Reminders Section */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <SectionHeader
          title="Reminders"
          count={count}
          icon={<FaCalendarAlt className="text-red-500 text-sm" />}
          color="bg-red-100"
          sectionKey="bookingReminders"
        />
        
        {!sectionsCollapsed.bookingReminders && (
          <div className="max-h-80 overflow-auto custom-scrollbar">
            {count === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCalendarAlt className="text-red-400 text-xl" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No bookings today</p>
                <p className="text-xs text-gray-400 mt-1">Your schedule is clear! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.slice(0, 8).map((booking, idx) => (
                  <div
                    key={idx}
                    className="group p-3 bg-white rounded-xl border border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        {booking.type === "seat" ? (
                          <FaChair className="text-red-600 text-sm" />
                        ) : (
                          <FaCar className="text-red-600 text-sm" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {booking.type === "seat" ? "Seat" : "Parking"}: {booking.details}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Today
                          </span>
                        </div>

                        {booking.location && (
                          <div className="flex items-center gap-2 mt-2">
                            <FaMapMarkerAlt className="text-gray-400 text-xs" />
                            <p className="text-xs text-gray-600">{booking.location}</p>
                          </div>
                        )}

                        {booking.entryTime && booking.exitTime && (
                          <div className="flex items-center gap-1 mt-1">
                            <FaClock className="text-gray-400 text-xs" />
                            <p className="text-xs text-gray-500 font-medium">
                              {booking.entryTime} - {booking.exitTime}
                            </p>
                          </div>
                        )}

                        {/* ADDED: Additional booking details if available */}
                  {booking.floor && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">Floor:</span>
                      <span className="text-xs text-gray-600 font-medium">{booking.floor}</span>
                    </div>
                  )}
                      </div>
                    </div>
                  </div>
                ))}
                {count > 8 && (
                  <div className="text-center py-2 border-t border-red-100">
                    <p className="text-sm text-gray-600">
                      ...and <span className="font-semibold text-red-600">{count - 5}</span> more
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <SectionHeader
          title="Announcements"
          count={filteredAnnouncements.length}
          icon={<FaBullhorn className="text-blue-500 text-sm" />}
          color="bg-blue-100"
          sectionKey="announcements"
          showActions={true}
          onAction={() => setShowReadAnnouncements(!showReadAnnouncements)}
          actionIcon={showReadAnnouncements ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          actionTitle={showReadAnnouncements ? "Hide read announcements" : "Show all announcements"}
        />
        
        {!sectionsCollapsed.announcements && (
          <div className="max-h-64 overflow-auto custom-scrollbar">
            {announcementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Loading announcements...</p>
              </div>
            ) : announcementsError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaExclamationTriangle className="text-red-400 text-xl" />
                </div>
                <p className="text-sm text-red-500 font-medium">{announcementsError}</p>
                <button
                  onClick={fetchAnnouncements}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBullhorn className="text-blue-400 text-xl" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {showReadAnnouncements ? "No announcements" : "No unread announcements"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {showReadAnnouncements ? "Check back later for updates" : "You're all caught up! 🎉"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`group p-3 bg-white rounded-xl border transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${
                      announcement.read 
                        ? 'border-gray-200 opacity-80' 
                        : 'border-blue-200 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm ${
                        announcement.read 
                          ? 'bg-gray-100' 
                          : 'bg-gradient-to-br from-blue-100 to-blue-200'
                      }`}>
                        <FaBullhorn className={`text-sm ${
                          announcement.read ? 'text-gray-400' : 'text-blue-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-medium text-sm leading-relaxed ${
                            announcement.read ? 'text-gray-600' : 'text-gray-800'
                          }`}>
                            {announcement.message}
                          </p>
                          {!announcement.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium">
                              {formatAnnouncementTime(announcement.createdAt)}
                            </span>
                            {!announcement.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                New
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!announcement.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAnnouncementAsRead(announcement._id);
                                }}
                                className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                title="Mark as read"
                              >
                                <FaEye size={12} />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this announcement?')) {
                                  deleteAnnouncement(announcement._id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <SectionHeader
          title="Notifications"
          count={userNotifications.length}
          icon={<FaEnvelope className="text-yellow-500 text-sm" />}
          color="bg-yellow-100"
          sectionKey="messages"
        />
        
        {!sectionsCollapsed.messages && (
          <div className="max-h-64 overflow-auto custom-scrollbar">
            {userNotifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaEnvelope className="text-yellow-400 text-xl" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No new messages</p>
                <p className="text-xs text-gray-400 mt-1">Your inbox is clean! 📬</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userNotifications.slice(0, 5).map((notif, idx) => (
                  <div key={idx} className="group p-3 bg-white rounded-xl border border-yellow-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        <FaEnvelope className="text-yellow-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm leading-relaxed">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {userNotifications.length > 5 && (
                  <div className="text-center py-2 border-t border-yellow-100">
                    <p className="text-sm text-gray-600">
                      ...and <span className="font-semibold text-yellow-600">{userNotifications.length - 5}</span> more
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Booking Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
  <SectionHeader
    title="Upcoming Bookings"
    count={upcomingBooking ? (Array.isArray(upcomingBooking) ? upcomingBooking.length : 1) : 0}
    icon={<FaBell className="text-purple-500 text-sm" />}
    color="bg-purple-100"
    sectionKey="upcoming"
  />
  
  {!sectionsCollapsed.upcoming && (
    <div className="max-h-64 overflow-auto custom-scrollbar">
      {!upcomingBooking || (Array.isArray(upcomingBooking) && upcomingBooking.length === 0) ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaBell className="text-purple-400 text-xl" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No upcoming bookings</p>
          <p className="text-xs text-gray-400 mt-1">Plan your next visit! 📅</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Handle both single object and array cases */}
          {(Array.isArray(upcomingBooking) ? upcomingBooking : [upcomingBooking]).map((booking, idx) => (
            <div key={idx} className="group p-3 bg-white rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-sm">
                  {booking.type === "seat" ? (
                    <FaChair className="text-purple-600 text-sm" />
                  ) : (
                    <FaCar className="text-purple-600 text-sm" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-purple-800 text-sm">
                      {booking.type === "seat" ? "Seat" : "Parking"}: {booking.details}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {Array.isArray(upcomingBooking) ? (idx === 0 ? 'Next' : `+${idx + 1}`) : 'Next'}
                    </span>
                  </div>

                  {booking.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" />
                      <p className="text-xs text-gray-600">{booking.location}</p>
                    </div>
                  )}

                  {booking.entryTime && booking.exitTime && (
                    <div className="flex items-center gap-1 mt-1">
                      <FaClock className="text-gray-400 text-xs" />
                      <p className="text-xs text-gray-500 font-medium">
                        {booking.entryTime} - {booking.exitTime}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 mt-2">
                    <FaCalendarAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-500 font-medium">
                      {booking.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NotificationsList;