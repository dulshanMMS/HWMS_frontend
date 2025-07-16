import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/messages';

// Get authentication header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Conversations API
export const conversationApi = {
  // Get all conversations for the current user
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_BASE}/conversations`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
    }
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await axios.get(
        `${API_BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch messages');
    }
  },

  // Create a new conversation
  create: async (participantIds, conversationType = 'direct', groupName = '') => {
    try {
      const response = await axios.post(
        `${API_BASE}/conversations`,
        {
          participantIds,
          conversationType,
          groupName: groupName || undefined
        },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create conversation');
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    try {
      const response = await axios.put(
        `${API_BASE}/conversations/${conversationId}/read`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to mark as read');
    }
  },

  // Pin/unpin conversation
  togglePin: async (conversationId) => {
    try {
      const response = await axios.put(
        `${API_BASE}/conversations/${conversationId}/pin`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to toggle pin status');
    }
  },

  // Mute/unmute conversation
  toggleMute: async (conversationId, muteDuration = 0) => {
    try {
      const response = await axios.put(
        `${API_BASE}/conversations/${conversationId}/mute`,
        { muteDuration },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to toggle mute status');
    }
  },

  // Search within a conversation
  searchMessages: async (conversationId, query) => {
    try {
      const response = await axios.get(
        `${API_BASE}/conversations/${conversationId}/search?query=${encodeURIComponent(query)}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search messages');
    }
  }
};

// Messages API
export const messageApi = {
  // Send a new message
  send: async (conversationId, messageData) => {
    try {
      const response = await axios.post(
        `${API_BASE}/conversations/${conversationId}/messages`,
        {
          conversationId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          bookingContext: messageData.bookingContext,
          replyTo: messageData.replyTo,
          attachments: messageData.attachments
        },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  },

  // Add reaction to a message
  addReaction: async (messageId, reaction) => {
    try {
      const response = await axios.post(
        `${API_BASE}/messages/${messageId}/reactions`,
        { reaction },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add reaction');
    }
  },

  // Delete a message
  delete: async (messageId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/messages/${messageId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete message');
    }
  },

  // Edit a message
  edit: async (messageId, newContent) => {
    try {
      const response = await axios.put(
        `${API_BASE}/messages/${messageId}`,
        { content: newContent },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to edit message');
    }
  },

  // Forward a message
  forward: async (messageId, conversationIds) => {
    try {
      const response = await axios.post(
        `${API_BASE}/messages/${messageId}/forward`,
        { conversationIds },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to forward message');
    }
  },

  // Send booking-related message
  sendBookingMessage: async (conversationId, bookingData, messageContent) => {
    try {
      const response = await axios.post(
        `${API_BASE}/conversations/${conversationId}/messages`,
        {
          conversationId,
          content: messageContent,
          messageType: 'booking',
          bookingContext: {
            bookingId: bookingData.bookingId,
            bookingType: bookingData.type, // 'seat' or 'parking'
            bookingDate: bookingData.date,
            slotInfo: bookingData.slotInfo
          }
        },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send booking message');
    }
  }
};

// Users API
export const userApi = {
  // Search users for new conversations
  search: async (query) => {
    try {
      const response = await axios.get(
        `${API_BASE}/search/users?query=${encodeURIComponent(query)}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search users');
    }
  },

  // Get user's online status
  getOnlineStatus: async (userIds) => {
    try {
      const response = await axios.post(
        `${API_BASE}/users/online-status`,
        { userIds },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get online status');
    }
  },

  // Get user's unread message count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/unread-count`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get unread count');
    }
  }
};

// File upload API
export const fileApi = {
  // Upload file attachment
  uploadFile: async (file, conversationId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const response = await axios.post(
        `${API_BASE}/upload`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload file');
    }
  }
};

// Real-time messaging helper
export const realtimeApi = {
  // Connect to Socket.IO for real-time messaging
  connectSocket: (token) => {
    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    return socket;
  },

  // Join conversation room
  joinConversation: (socket, conversationId) => {
    socket.emit('joinConversation', conversationId);
  },

  // Leave conversation room
  leaveConversation: (socket, conversationId) => {
    socket.emit('leaveConversation', conversationId);
  },

  // Update user's online status
  updateOnlineStatus: (socket, isOnline) => {
    socket.emit('updateOnlineStatus', isOnline);
  },

  // Send typing indicator
  sendTypingIndicator: (socket, conversationId, isTyping) => {
    socket.emit('typing', { conversationId, isTyping });
  }
};

// Quick message templates for booking-related conversations
export const messageTemplates = {
  booking: {
    seatRequest: (date, seatInfo) => 
      `Hi! I'd like to book a seat for ${date}. Do you know if ${seatInfo} is available?`,
    
    parkingRequest: (date, floor) => 
      `Hello! I need parking for ${date}. Any spots available on floor ${floor}?`,
    
    seatSwap: (currentSeat, desiredSeat, date) => 
      `Hi! I have ${currentSeat} booked for ${date}. Would you like to swap for ${desiredSeat}?`,
    
    bookingConfirm: (bookingType, details) => 
      `✅ ${bookingType} booking confirmed: ${details}`,
    
    bookingCancel: (bookingType, details) => 
      `❌ ${bookingType} booking cancelled: ${details}`,
    
    teamMeeting: (date, location) => 
      `📅 Team meeting scheduled for ${date} at ${location}. Please book nearby seats!`,
    
    floorAvailability: (floor, date) => 
      `Floor ${floor} availability check for ${date}. Anyone know the current status?`,
    
    urgentBooking: (date, requirement) => 
      `🚨 Urgent: Need ${requirement} for ${date}. Can anyone help or swap?`
  },
  
  general: {
    greeting: () => 'Hi there! 👋',
    thanks: () => 'Thank you! 🙏',
    confirm: () => 'Confirmed! ✅',
    declined: () => 'Sorry, not available 😔',
    checking: () => 'Let me check and get back to you... 🔍'
  }
};

// Export all APIs
export default {
  conversationApi,
  messageApi,
  userApi,
  fileApi,
  realtimeApi,
  messageTemplates
};