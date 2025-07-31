import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaCircle, FaEllipsisV } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import io from 'socket.io-client';
import axios from 'axios';

const ChatArea = ({ 
  activeConversation, 
  messages: initialMessages, 
  onSendMessage, 
  onBackToList,
  showConversationList,
  isMobile,
  currentUser,
  onMessagesUpdate
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [messages, setMessages] = useState(initialMessages || []);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const MESSAGES_PER_PAGE = 10;

  // ✅ Function to load older messages
  const loadOlderMessages = async () => {
    if (!activeConversation || isLoadingOlder || !hasMoreMessages) return;

    setIsLoadingOlder(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages?page=${currentPage + 1}&limit=${MESSAGES_PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const olderMessages = response.data.messages || [];
        const pagination = response.data.pagination || {};
        
        if (olderMessages.length > 0) {
          // Store current scroll position
          const container = messagesContainerRef.current;
          const scrollHeight = container.scrollHeight;
          
          // Prepend older messages
          setMessages(prev => [...olderMessages, ...prev]);
          setCurrentPage(prev => prev + 1);
          setHasMoreMessages(pagination.hasMore || false);
          
          // Restore scroll position to prevent jumping
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - scrollHeight;
            }
          }, 50);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // ✅ Scroll event handler
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Show scroll to bottom button when not at bottom
    setShowScrollToBottom(scrollTop < scrollHeight - clientHeight - 100);
    
    // Load more when user scrolls near the top (within 100px)
    if (scrollTop < 100 && hasMoreMessages && !isLoadingOlder) {
      loadOlderMessages();
    }
  };

  // ✅ Initial message loading - only load first 10 messages
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(true);
      setTotalMessages(0);
      return;
    }

    // Load initial messages (first page)
    const loadInitialMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/messages/conversations/${activeConversation._id}/messages?page=1&limit=${MESSAGES_PER_PAGE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          const initialMsgs = response.data.messages || [];
          const pagination = response.data.pagination || {};
          
          setMessages(initialMsgs);
          setCurrentPage(1);
          setHasMoreMessages(pagination.hasMore || false);
          setTotalMessages(pagination.total || initialMsgs.length);
          
          // Update parent if callback provided
          if (onMessagesUpdate) {
            onMessagesUpdate(initialMsgs);
          }
        }
      } catch (error) {
        console.error('Error loading initial messages:', error);
        setMessages([]);
      }
    };

    loadInitialMessages();
  }, [activeConversation?._id]);

  // Initialize socket connection for real-time messaging
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !activeConversation) return;

    console.log('Initializing socket for conversation:', activeConversation._id);

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);
    newSocket.emit('authenticateMessaging', token);

    newSocket.on('messagingAuthenticated', (data) => {
      if (data.success) {
        setIsConnected(true);
        console.log('Chat area authenticated:', data.user);
        newSocket.emit('joinMessagingConversation', activeConversation._id);
      }
    });

    newSocket.on('messagingAuthError', (error) => {
      console.error('Chat area auth error:', error);
      setIsConnected(false);
    });

    // Handle real-time message updates
    newSocket.on('newMessagingMessage', (data) => {
      console.log('New message received in chat area:', data);
      
      if (data.conversationId === activeConversation._id) {
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg._id === data.message._id);
          if (messageExists) {
            console.log('Message already exists, skipping duplicate');
            return prevMessages;
          }
          
          const newMessages = [...prevMessages, data.message];
          
          if (onMessagesUpdate) {
            onMessagesUpdate(newMessages);
          }
          
          return newMessages;
        });

        if (data.message.sender._id !== currentUser?.id) {
          showMessageReceivedAnimation();
        }
      }
    });

    // Handle typing indicators
    newSocket.on('userTypingInMessaging', (data) => {
      if (data.conversationId === activeConversation._id && data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(u => u.userId !== data.userId), data];
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });

        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
          }, 3000);
        }
      }
    });

    newSocket.on('messagingUserStatusUpdate', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.isOnline) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Chat area connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Chat area disconnected from server');
    });

    newSocket.on('messageSuccessfullySent', (message) => {
      console.log('Message sent successfully:', message);
    });

    newSocket.on('messagingError', (error) => {
      console.error('Messaging error:', error);
    });

    return () => {
      if (activeConversation) {
        newSocket.emit('leaveMessagingConversation', activeConversation._id);
      }
      newSocket.disconnect();
    };
  }, [activeConversation?._id, currentUser?.id]);

  // ✅ Auto-scroll only for new messages, not when loading older ones
  useEffect(() => {
    if (!isLoadingOlder) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingOlder]);

  useEffect(() => {
    setTypingUsers([]);
    setIsTyping(false);
  }, [activeConversation?._id]);

  const showMessageReceivedAnimation = () => {
    const chatContainer = document.querySelector('[data-chat-container]');
    if (chatContainer) {
      chatContainer.classList.add('animate-pulse');
      setTimeout(() => {
        chatContainer.classList.remove('animate-pulse');
      }, 500);
    }
  };

  const handleSendMessage = async (messageContent) => {
    if (!socket || !isConnected || !activeConversation) {
      console.error('Cannot send message: socket not connected or no active conversation');
      return false;
    }

    try {
      socket.emit('sendMessageViaSocket', {
        conversationId: activeConversation._id,
        content: messageContent,
        messageType: 'text',
        replyTo: replyingTo?._id,
        bookingContext: null
      });

      setReplyingTo(null);
      stopTyping();
      
      return true;

    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const handleTyping = () => {
    if (!socket || !isConnected || !activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('messagingTyping', {
        conversationId: activeConversation._id,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (socket && isConnected && activeConversation && isTyping) {
      setIsTyping(false);
      socket.emit('messagingTyping', {
        conversationId: activeConversation._id,
        isTyping: false
      });
    }
  };

  const determineOwnership = (message) => {
    if (currentUser?.id && message.sender?._id === currentUser.id) {
      return true;
    }
    if (currentUser?.username && message.senderUsername === currentUser.username) {
      return true;
    }
    if (message.sender?._id?.toString() === currentUser?.id?.toString()) {
      return true;
    }
    return false;
  };

  // ✅ Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
  };

  if (!activeConversation) {
    return (
      <div className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col h-full`}>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/3 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
            <div className="absolute bottom-1/4 right-1/3 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed"></div>
          </div>

          <div className="text-center max-w-xs sm:max-w-md relative z-10 p-4 sm:p-8">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 md:w-32 sm:h-24 md:h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <FaComments className="w-8 h-8 sm:w-12 md:w-16 sm:h-12 md:h-16 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-sm sm:text-xl">💬</span>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to HWMS Messaging
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
              Connect with your colleagues to coordinate workspace bookings, 
              discuss seating arrangements, and collaborate effectively.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Real-time messaging</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Booking coordination</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col h-full bg-gradient-to-b from-white to-gray-50 overflow-hidden relative`}
      data-chat-container
    >
      {/* Enhanced Chat Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {isMobile && (
              <button
                onClick={onBackToList}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              >
                <FiArrowLeft className="text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>
            )}
            
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg overflow-hidden">
                {activeConversation.displayPhoto ? (
                  <img 
                    src={activeConversation.displayPhoto} 
                    alt={activeConversation.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span 
                  className={`text-sm sm:text-base md:text-lg font-bold text-white ${activeConversation.displayPhoto ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                  style={{ display: activeConversation.displayPhoto ? 'none' : 'flex' }}
                >
                  {activeConversation.displayName ? activeConversation.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </span>
              </div>
              
              {activeConversation.isOnline && isConnected && (
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="absolute w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">
                {activeConversation.displayName}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  isConnected && activeConversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {!isConnected ? 'Connecting...' : 
                   activeConversation.isOnline ? 'Active now' : 'Last seen recently'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500 hidden sm:block">
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Messages Container with pagination */}
      <div 
        ref={messagesContainerRef}
        className="messages-container flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 bg-gradient-to-b from-gray-50/30 to-white"
        onScroll={handleScroll}
      >
        {/* ✅ Load more indicator at the top */}
        {hasMoreMessages && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingOlder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 hover:scale-105 transform duration-200"
            >
              {isLoadingOlder ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading older messages...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Load older messages ({totalMessages > messages.length ? totalMessages - messages.length : 0} more)
                </>
              )}
            </button>
          </div>
        )}

        {/* ✅ Loading indicator when fetching older messages */}
        {isLoadingOlder && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full message-fade-in">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-600">Loading...</span>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
            <div className="relative mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl md:text-4xl animate-bounce">💬</span>
              </div>
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">!</span>
              </div>
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">Start the conversation!</h4>
            <p className="text-gray-500 max-w-xs sm:max-w-md leading-relaxed text-sm sm:text-base px-2">
              Send your first message to {activeConversation.displayName} and begin collaborating on workspace bookings.
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'Ready to send messages' : 'Connecting to chat server...'}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message, index) => {
              const isOwn = determineOwnership(message);
              const prevMessage = messages[index - 1];
              const showDateSeparator = !prevMessage || 
                new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
              
              return (
                <div key={message._id} className="message-fade-in">
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4 sm:my-6">
                      <div className="bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-md border border-gray-200">
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          {new Date(message.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    activeConversation={activeConversation}
                    onReply={setReplyingTo}
                  />
                </div>
              );
            })}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">
                        {typingUsers.length === 1 
                          ? `${typingUsers[0].username} is typing...`
                          : `${typingUsers.length} people are typing...`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 z-10 hover:scale-110 transform"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Enhanced Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onTyping={handleTyping}
        onStopTyping={stopTyping}
        isConnected={isConnected}
        disabled={!isConnected}
      />

      {/* Connection status banner */}
      {!isConnected && (
        <div className="bg-yellow-100 border-t border-yellow-200 px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Reconnecting to chat server...</span>
          </div>
        </div>
      )}

      {/* ✅ Custom CSS Styles */}
      <style jsx>{`
        /* Scrollbar styling */
        .messages-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Smooth loading animation */
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .message-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* Float animations for background elements */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatArea;