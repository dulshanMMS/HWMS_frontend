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
      <div className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col bg-white max-w-4xl`}>
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Welcome to HWMS Messaging
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Connect with your colleagues to coordinate workspace bookings, 
              discuss seating arrangements, and collaborate effectively.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${!showConversationList || !isMobile ? 'flex-1' : 'hidden md:flex md:flex-1'} flex flex-col bg-white max-w-4xl`}>
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={onBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="text-gray-600" />
              </button>
            )}
            
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {activeConversation.displayName ? activeConversation.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </span>
              </div>
              {activeConversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">
                {activeConversation.displayName}
              </h3>
              <p className="text-sm text-gray-500">
                {activeConversation.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50/30 to-white">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">💬</div>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = determineOwnership(message);
            
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={isOwn}
                activeConversation={activeConversation}
                onReply={setReplyingTo}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

export default ChatArea;