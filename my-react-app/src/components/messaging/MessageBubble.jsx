import React from 'react';
import { FaComments, FaCheckDouble, FaReply } from 'react-icons/fa';

const MessageBubble = ({ message, isOwn, activeConversation, onReply }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Reply context */}
        {message.replyTo && (
          <div className="mb-2 p-2 bg-gray-200 rounded-lg text-sm">
            <p className="text-gray-600">Replying to:</p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}
        
        <div
          className={`p-4 rounded-2xl shadow-sm relative group ${
            isOwn
              ? 'bg-green-500 text-white rounded-br-md'
      : 'bg-blue-100 text-blue-900 rounded-bl-md'
          } ${message.isDeleted ? 'italic opacity-75' : ''}`}
        >
          {/* Show sender name for group messages (but not for own messages) */}
          {!isOwn && activeConversation.conversationType === 'group' && (
            <p className="text-xs font-semibold mb-2 opacity-75">
              {message.senderName}
            </p>
          )}
          
          {/* Booking context */}
          {message.messageType === 'booking' && message.bookingContext && (
            <div className={`p-3 rounded-lg mb-2 ${isOwn ? 'bg-green-600' : 'bg-green-50'} border-l-4 border-green-500`}>
              <div className="flex items-center gap-2 mb-1">
                <FaComments className={`text-sm ${isOwn ? 'text-green-100' : 'text-green-600'}`} />
                <span className={`text-sm font-medium ${isOwn ? 'text-green-100' : 'text-green-700'}`}>
                  {message.bookingContext.bookingType === 'seat' ? 'Seat Booking' : 'Parking Booking'}
                </span>
              </div>
              <p className={`text-sm ${isOwn ? 'text-green-100' : 'text-green-600'}`}>
                📅 {message.bookingContext.bookingDate}
              </p>
              <p className={`text-sm ${isOwn ? 'text-green-100' : 'text-green-600'}`}>
                📍 {message.bookingContext.slotInfo}
              </p>
            </div>
          )}
          
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-75">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <FaCheckDouble className="text-green-200 text-xs" />
            )}
          </div>

          {/* Reply button - shows on hover */}
          {!isOwn && (
            <button
              onClick={() => onReply(message)}
              className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              title="Reply to this message"
            >
              <FaReply className="text-gray-600 text-xs" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;