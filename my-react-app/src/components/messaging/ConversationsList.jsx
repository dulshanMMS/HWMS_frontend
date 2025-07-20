import React, { useState } from 'react';
import { FaSearch, FaPlus, FaComments, FaUsers } from 'react-icons/fa';

const ConversationsList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat,
  showConversationList,
  isMobile
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${showConversationList || !isMobile ? 'w-full md:w-80' : 'hidden'} bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <FaComments className="text-green-600 text-xl" />
            </div>
            Messages
          </h2>
          <button
            onClick={onNewChat}
            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-lg"
            title="Start new conversation"
          >
            <FaPlus className="text-lg" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaComments className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-center mb-4">Start messaging your colleagues about workspace bookings</p>
            <button
              onClick={onNewChat}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              Start Messaging
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                activeConversation?._id === conversation._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ring-2 ring-white shadow-sm">
                    <span className="text-sm font-semibold text-gray-600">
                      {conversation.displayName ? conversation.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                    </span>
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {conversation.conversationType === 'group' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <FaUsers className="text-white text-xs" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {conversation.displayName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.sender}: {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsList;