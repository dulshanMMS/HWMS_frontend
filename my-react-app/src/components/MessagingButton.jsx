import React, { useState, useEffect } from "react";
import { FaComments, FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/messageApi";
import { getProfile } from "../api/userApi";
import io from 'socket.io-client';

/**
 * MessagingButton - A floating action button for accessing messaging with real-time updates
 * Displays unread message count and provides quick access to messaging page
 *
 * Props:
 * - className (string): Additional CSS classes
 * - position (string): 'fixed' or 'relative' positioning
 * - size (string): 'sm', 'md', 'lg' for different sizes
 */
const MessagingButton = ({
  className = "",
  position = "fixed",
  size = "md",
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "w-12 h-12",
      icon: "text-lg",
      badge: "w-5 h-5 text-xs",
      badgePosition: "-top-1 -right-1",
    },
    md: {
      button: "w-14 h-14",
      icon: "text-xl",
      badge: "w-6 h-6 text-sm",
      badgePosition: "-top-2 -right-2",
    },
    lg: {
      button: "w-16 h-16",
      icon: "text-2xl",
      badge: "w-7 h-7 text-sm",
      badgePosition: "-top-2 -right-2",
    },
  };

  const config = sizeConfig[size];

  // Initialize socket connection and real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    // Authenticate for messaging
    newSocket.emit('authenticateMessaging', token);

    // Handle authentication response
    newSocket.on('messagingAuthenticated', (data) => {
      if (data.success) {
        setIsOnline(true);
        console.log('Messaging authenticated for button:', data.user);
      }
    });

    // Handle authentication errors
    newSocket.on('messagingAuthError', (error) => {
      console.error('Messaging auth error:', error);
      setIsOnline(false);
    });

    // Real-time message updates
    newSocket.on('newMessagingMessage', (data) => {
      console.log('New message received in button:', data);
      // Update unread count when new message arrives
      fetchUnreadCount();
      
      // Show notification animation
      showNewMessageAnimation();
    });

    // Handle user status updates
    newSocket.on('messagingUserStatusUpdate', (data) => {
      console.log('User status update:', data);
    });

    // Handle connection status
    newSocket.on('connect', () => {
      setIsOnline(true);
      console.log('Messaging button connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsOnline(false);
      console.log('Messaging button disconnected from server');
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial unread count and set up periodic checks
  useEffect(() => {
    fetchUnreadCount();

    // Set up interval to check for new messages every 30 seconds as fallback
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await userApi.getUnreadCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation for new message arrival
  const showNewMessageAnimation = () => {
    // Add a subtle animation class temporarily
    const button = document.querySelector('[data-messaging-button]');
    if (button) {
      button.classList.add('animate-bounce');
      setTimeout(() => {
        button.classList.remove('animate-bounce');
      }, 1000);
    }
  };

  const handleClick = () => {
    navigate("/messaging");
  };

  const positionClasses =
    position === "fixed" ? "fixed bottom-6 right-6 z-50" : "relative";

  return (
    <button
      onClick={handleClick}
      data-messaging-button
      className={`
        ${positionClasses}
        ${config.button}
        bg-gradient-to-r from-green-500 to-green-600
        hover:from-green-600 hover:to-green-700
        text-white
        rounded-full
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-300
        flex items-center justify-center
        group
        ${className}
        ${!isOnline ? 'opacity-75' : ''}
      `}
      title={`Open Messaging ${!isOnline ? '(Connecting...)' : ''}`}
    >
      {/* Main Icon */}
      <FaComments
        className={`${config.icon} group-hover:scale-110 transition-transform duration-200`}
      />

      {/* Unread Badge with real-time updates */}
      {!isLoading && unreadCount > 0 && (
        <div
          className={`
          absolute ${config.badgePosition}
          ${config.badge}
          bg-red-500
          text-white
          rounded-full
          flex items-center justify-center
          font-bold
          border-2 border-white
          animate-pulse
        `}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}

      {/* Online Indicator with real-time status */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}>
        {isOnline && (
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
        )}
      </div>

      {/* Enhanced Tooltip with real-time info */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {!isOnline ? 'Connecting to chat...' : 
         unreadCount > 0 ? `${unreadCount} new messages` : 'Messages'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
      </div>

      
    </button>
  );
};

/**
 * MessagingFloatingButton - Specific implementation for floating usage
 */
export const MessagingFloatingButton = () => {
  return <MessagingButton position="fixed" size="md" />;
};

/**
 * MessagingInlineButton - For use within other components
 */
export const MessagingInlineButton = ({ className = "", size = "sm" }) => {
  return (
    <MessagingButton position="relative" size={size} className={className} />
  );
};

/**
 * MessagingQuickAccess - A more detailed messaging access component with real-time updates
 * Can be used in sidebars or navigation areas
 */
export const MessagingQuickAccess = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    // Authenticate for messaging
    newSocket.emit('authenticateMessaging', token);

    // Handle real-time updates
    newSocket.on('messagingAuthenticated', (data) => {
      if (data.success) {
        setIsOnline(true);
        fetchMessagingData();
      }
    });

    newSocket.on('newMessagingMessage', (data) => {
      fetchMessagingData(); // Refresh data when new message arrives
    });

    newSocket.on('connect', () => setIsOnline(true));
    newSocket.on('disconnect', () => setIsOnline(false));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchMessagingData = async () => {
    try {
      const [unreadResponse] = await Promise.all([
        userApi.getUnreadCount(),
        // You might want to add a quick conversations endpoint
        // conversationApi.getRecentConversations(3)
      ]);

      setUnreadCount(unreadResponse.unreadCount || 0);
      // setRecentMessages(conversationsResponse.conversations || []);
    } catch (error) {
      console.error("Error fetching messaging data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaComments className="text-green-500" />
          Messages
          {!isOnline && (
            <span className="text-xs text-orange-500">(Connecting...)</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {unreadCount > 0 ? (
          <p className="text-sm text-gray-600">
            You have {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            All caught up! 🎉
            {isOnline && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
          </p>
        )}

        <button
          onClick={() => navigate("/messaging")}
          disabled={!isOnline}
          className={`w-full py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
            isOnline 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isOnline ? 'Open Messages' : 'Connecting...'}
        </button>
      </div>
    </div>
  );
};

/**
 * MessagingStatusIndicator - Shows just the status without button functionality
 */
export const MessagingStatusIndicator = ({ className = "" }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);
    newSocket.emit('authenticateMessaging', token);

    // Real-time unread count updates
    const fetchUnreadCount = async () => {
      try {
        const response = await userApi.getUnreadCount();
        setUnreadCount(response.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    newSocket.on('messagingAuthenticated', fetchUnreadCount);
    newSocket.on('newMessagingMessage', fetchUnreadCount);

    // Initial fetch
    fetchUnreadCount();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <FaComments className="text-gray-600" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}
    </div>
  );
};

export default MessagingButton;