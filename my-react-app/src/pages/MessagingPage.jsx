import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LeftSidebar from '../components/LeftSidebar';
import ConversationsList from '../components/messaging/ConversationsList';
import ChatArea from '../components/messaging/ChatArea';
import NewChatModal from '../components/messaging/NewChatModal';

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
    console.log('Decoded user from token:', decoded);
    
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
          isOnline: true
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
      <div className="min-h-screen flex">
        <LeftSidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <LeftSidebar />
      
      <div className="flex-1 flex max-h-screen">
        <ConversationsList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={selectConversation}
          onNewChat={() => setShowNewChat(true)}
          showConversationList={showConversationList}
          isMobile={isMobile}
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