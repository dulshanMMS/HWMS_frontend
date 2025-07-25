import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LeftSidebar from '../components/LeftSidebar';
import ConversationsList from '../components/messaging/ConversationsList';
import ChatArea from '../components/messaging/ChatArea';
import NewChatModal from '../components/messaging/NewChatModal';
import io from 'socket.io-client';

const MessagingPage = () => {
  // Core states
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI states
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);
  
  const token = localStorage.getItem('token');
  const getCurrentUser = () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) return {};
      
      // Decode the JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      
      return {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return {};
    }
  };

  const currentUser = getCurrentUser();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch conversations from backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setConversations(response.data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchConversations();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Real-time messaging socket connection
  useEffect(() => {
    if (!token || conversations.length === 0) return;

    // Create socket connection with authentication
    const socket = io('http://localhost:5000', {
      auth: { token }
    });

    // Authenticate for messaging
    socket.emit('authenticateMessaging', token);

    // Listen for authentication confirmation
    socket.on('messagingAuthenticated', (data) => {
      console.log('Messaging authenticated:', data);
    });

    // Listen for user status updates
    socket.on('messagingUserStatusUpdate', (statusUpdate) => {
      setConversations(prev => prev.map(conv => {
        // Update conversation participants' online status
        const updatedParticipants = conv.participants?.map(p => {
          if (p.userId._id === statusUpdate.userId || p.userId === statusUpdate.userId) {
            return { ...p, isOnline: statusUpdate.isOnline, lastSeen: statusUpdate.lastSeen };
          }
          return p;
        });

        // Update conversation-level online status
        const hasOnlineParticipants = updatedParticipants?.some(p => 
          p.userId._id !== currentUser.id && p.isOnline
        );

        return {
          ...conv,
          participants: updatedParticipants,
          isOnline: hasOnlineParticipants
        };
      }));

      // Update active conversation if it matches
      if (activeConversation && 
          (activeConversation.participants?.some(p => 
            p.userId._id === statusUpdate.userId || p.userId === statusUpdate.userId))) {
        setActiveConversation(prev => ({
          ...prev,
          participants: prev.participants?.map(p => {
            if (p.userId._id === statusUpdate.userId || p.userId === statusUpdate.userId) {
              return { ...p, isOnline: statusUpdate.isOnline, lastSeen: statusUpdate.lastSeen };
            }
            return p;
          }),
          isOnline: statusUpdate.userId !== currentUser.id ? statusUpdate.isOnline : prev.isOnline
        }));
      }
    });

    // Listen for new messages to update conversation order
    socket.on('newMessagingMessage', (data) => {
      const { conversationId, message } = data;
      
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                sender: message.senderName,
                timestamp: message.createdAt
              },
              updatedAt: message.createdAt
            };
          }
          return conv;
        });
        
        // Sort by most recent activity
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      // Add message to active conversation if it's the same
      if (activeConversation?._id === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for typing indicators
    socket.on('userTypingInMessaging', (data) => {
      // Handle typing indicators if needed
      console.log('User typing:', data);
    });

    // Join conversation rooms
    conversations.forEach(conv => {
      socket.emit('joinMessagingConversation', conv._id);
    });

    return () => {
      conversations.forEach(conv => {
        socket.emit('leaveMessagingConversation', conv._id);
      });
      socket.disconnect();
    };
  }, [token, conversations.length, currentUser.id, activeConversation?._id]);

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversations/${conversation._id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMessages(response.data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
    
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const sendMessage = async (messageContent, replyTo = null) => {
    if (!messageContent.trim() || !activeConversation) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages`,
        {
          content: messageContent.trim(),
          messageType: 'text',
          replyTo: replyTo?._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const savedMessage = response.data.message;
        
        // Add message to local state
        setMessages(prev => [...prev, savedMessage]);
        
        // Update conversation's last message
        setConversations(prev => prev.map(conv => 
          conv._id === activeConversation._id 
            ? {
                ...conv,
                lastMessage: {
                  content: savedMessage.content,
                  sender: savedMessage.senderName,
                  timestamp: savedMessage.createdAt
                },
                updatedAt: savedMessage.createdAt
              }
            : conv
        ));
        
        return true;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const createConversation = async (participantIds, type = 'direct', groupName = '') => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/conversations',
        {
          participantIds,
          conversationType: type,
          groupName: type === 'group' ? groupName : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const conversation = response.data.conversation;
        
        const formattedConversation = {
          _id: conversation._id,
          conversationType: conversation.conversationType,
          participants: conversation.participants,
          displayName: conversation.conversationType === 'group' 
            ? conversation.groupName 
            : conversation.participants
                .filter(p => p.userId._id !== currentUser.id)
                .map(p => `${p.firstName} ${p.lastName}`)
                .join(', '),
          lastMessage: conversation.lastMessage,
          totalMessages: conversation.totalMessages || 0,
          updatedAt: conversation.updatedAt || new Date(),
          isOnline: conversation.participants.some(p => 
            p.userId._id !== currentUser.id && p.isOnline
          )
        };
        
        if (response.data.isNew) {
          setConversations(prev => [formattedConversation, ...prev]);
        }
        
        setActiveConversation(formattedConversation);
        setMessages([]);
        
        if (isMobile) {
          setShowConversationList(false);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          {/* Loading Container Box */}
          <div className="w-full max-w-6xl h-full bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-pulse mx-auto"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-700">Loading Messages</h3>
                <p className="text-gray-500">Connecting you with your workspace...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <LeftSidebar />
      
      {/* Main Content Area with Padding */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 lg:p-6">
        {/* MESSAGING CONTAINER BOX - This forces proper width and creates a contained look */}
        <div className="w-full h-full max-w-none bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex">
          {/* Decorative Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-t-3xl z-10"></div>
          
          {/* Background Pattern Inside Container */}
          <div className="absolute inset-0 opacity-5 pointer-events-none rounded-3xl overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          </div>

          {/* Content Area - Now properly contained */}
          <div className="relative z-10 flex w-full h-full">
            <ConversationsList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={selectConversation}
              onNewChat={() => setShowNewChat(true)}
              showConversationList={showConversationList}
              isMobile={isMobile}
              currentUser={currentUser}
            />
            
            <ChatArea
              activeConversation={activeConversation}
              messages={messages}
              onSendMessage={sendMessage}
              onBackToList={() => setShowConversationList(true)}
              showConversationList={showConversationList}
              isMobile={isMobile}
              currentUser={currentUser}
            />
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-4 right-10 w-2 h-2 bg-blue-500 rounded-full opacity-40 animate-pulse delay-300"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-500 rounded-full opacity-50 animate-pulse delay-700"></div>
        </div>
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreateConversation={createConversation}
          token={token}
        />
      )}
      
    </div>
  );
};

export default MessagingPage;