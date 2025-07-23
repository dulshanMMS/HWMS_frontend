import React, { useState, useRef, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatArea = ({ 
  activeConversation, 
  messages, 
  onSendMessage, 
  onBackToList,
  showConversationList,
  isMobile,
  currentUser
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageContent) => {
    const success = await onSendMessage(messageContent, replyingTo);
    if (success) {
      setReplyingTo(null);
    }
    return success;
  };

  const determineOwnership = (message) => {
    // Try different methods to determine if message is from current user
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

  if (!activeConversation) {
    return (
      <div className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col h-full`}>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
          {/* Animated Background Elements */}
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
    <div className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col h-full bg-gradient-to-b from-white to-gray-50 overflow-hidden`}>
      {/* Simplified Chat Header */}
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
              <div className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                <span className="text-sm sm:text-base md:text-lg font-bold text-white">
                  {activeConversation.displayName ? activeConversation.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </span>
              </div>
              {activeConversation.isOnline && (
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
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activeConversation.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {activeConversation.isOnline ? 'Active now' : 'Last seen recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 bg-gradient-to-b from-gray-50/30 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message, index) => {
              const isOwn = determineOwnership(message);
              const prevMessage = messages[index - 1];
              const showDateSeparator = !prevMessage || 
                new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
              
              return (
                <div key={message._id}>
                  {/* Date Separator */}
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
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

export default ChatArea;