import React from 'react';
import { FaComments, FaCheckDouble, FaReply, FaCar, FaChair, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const MessageBubble = ({ message, isOwn, activeConversation, onReply }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'order-2' : 'order-1'} relative`}>
        {/* Reply context */}
        {message.replyTo && (
          <div className="mb-3 p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border-l-4 border-blue-400 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FaReply className="text-blue-500 text-xs" />
              <span className="text-xs font-medium text-gray-600">Replying to:</span>
            </div>
            <p className="text-sm text-gray-700 truncate italic">"{message.replyTo.content}"</p>
          </div>
        )}
        
        <div
          className={`relative p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] ${
            isOwn
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md shadow-green-200'
              : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-bl-md shadow-gray-200 border border-gray-100'
          } ${message.isDeleted ? 'italic opacity-75' : ''}`}
        >
          {/* Show sender name for group messages (but not for own messages) */}
          {!isOwn && activeConversation.conversationType === 'group' && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {message.senderName ? message.senderName.split(' ').map(n => n[0]).join('') : '?'}
                </span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {message.senderName}
              </span>
            </div>
          )}
          
          {/* Enhanced Booking context */}
          {message.messageType === 'booking' && message.bookingContext && (
            <div className={`p-4 rounded-xl mb-3 backdrop-blur-sm ${
              isOwn 
                ? 'bg-white/20 border border-white/30' 
                : 'bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {message.bookingContext.bookingType === 'seat' ? (
                  <FaChair className={`text-lg ${isOwn ? 'text-white' : 'text-green-600'}`} />
                ) : (
                  <FaCar className={`text-lg ${isOwn ? 'text-white' : 'text-blue-600'}`} />
                )}
                <span className={`font-semibold ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                  {message.bookingContext.bookingType === 'seat' ? 'Seat Booking' : 'Parking Booking'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className={`text-sm ${isOwn ? 'text-green-100' : 'text-blue-500'}`} />
                  <span className={`text-sm font-medium ${isOwn ? 'text-green-100' : 'text-gray-700'}`}>
                    {message.bookingContext.bookingDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className={`text-sm ${isOwn ? 'text-green-100' : 'text-green-500'}`} />
                  <span className={`text-sm ${isOwn ? 'text-green-100' : 'text-gray-600'}`}>
                    {message.bookingContext.slotInfo}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Message content */}
          <div className="relative z-10">
            <p className={`text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-gray-800'}`}>
              {message.content}
            </p>
          </div>
          
          {/* Message footer */}
          <div className="flex items-center justify-between mt-3 pt-2">
            <span className={`text-xs font-medium ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <div className="flex items-center gap-1">
                <FaCheckDouble className="text-green-200 text-sm animate-pulse" />
                <span className="text-xs text-green-100">Delivered</span>
              </div>
            )}
          </div>

          {/* Message reactions placeholder */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {message.reactions.slice(0, 3).map((reaction, index) => (
                <div 
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                    isOwn ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>{reaction.reaction}</span>
                  <span className="text-xs">1</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Reply button */}
        {!isOwn && (
          <button
            onClick={() => onReply(message)}
            className="absolute -left-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white hover:bg-blue-50 rounded-full p-2 shadow-lg border border-gray-200 hover:border-blue-300 hover:scale-110"
            title="Reply to this message"
          >
            <FaReply className="text-blue-500 text-sm" />
          </button>
        )}

        {/* Message status indicators */}
        {isOwn && (
          <div className="absolute -right-8 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-1 shadow-md border border-gray-200">
              <FaCheckDouble className="text-green-500 text-xs" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;