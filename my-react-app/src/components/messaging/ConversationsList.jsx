import React, { useState } from 'react';
import { FaSearch, FaPlus, FaComments, FaUsers } from 'react-icons/fa';

const ConversationsList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat,
  showConversationList,
  isMobile,
  currentUser
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

  const formatLastSeen = (lastSeenTimestamp) => {
    if (!lastSeenTimestamp) return 'Last seen recently';
    
    const lastSeen = new Date(lastSeenTimestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Last seen recently';
    if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Last seen ${Math.floor(diffMinutes / 60)}h ago`;
    return `Last seen ${lastSeen.toLocaleDateString()}`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${showConversationList || !isMobile ? 'w-full sm:w-96 md:w-[480px] lg:w-[520px] flex-shrink-0' : 'hidden'} h-full bg-white/95 backdrop-blur-sm border-r border-gray-200/50 flex flex-col`}>
      {/* Enhanced Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
              <FaComments className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-wide">Messages</h2>
              <p className="text-green-100 text-xs sm:text-sm hidden sm:block">Stay connected with your team</p>
            </div>
          </div>
          <button
            onClick={onNewChat}
            className="group p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            title="Start new conversation"
          >
            <FaPlus className="text-white text-base sm:text-lg group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        
        {/* Enhanced Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-white/60 text-sm sm:text-base" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-300 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
            <div className="relative mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <FaComments className="text-green-500 text-xl sm:text-2xl animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <FaPlus className="text-white text-xs sm:text-sm" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">No conversations yet</h3>
            <p className="text-gray-500 text-center mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base px-2">
              Start connecting with your colleagues about workspace bookings and collaboration
            </p>
            <button
              onClick={onNewChat}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
            >
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              // Get the other participant for status display
              const otherParticipant = conversation.participants?.find(p => 
                p.userId._id !== currentUser?.id
              );

              return (
                <div
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`relative p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 group ${
                    activeConversation?._id === conversation._id 
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-r-4 border-green-500 shadow-md' 
                      : ''
                  }`}
                >
                  {/* Active Indicator */}
                  {activeConversation?._id === conversation._id && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 sm:h-12 bg-gradient-to-b from-green-400 to-blue-500 rounded-r-full"></div>
                  )}

                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-sm sm:text-lg font-bold text-white">
                          {conversation.displayName ? conversation.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                        </span>
                      </div>
                      
                      {/* Real-time Online Status */}
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                          <div className="w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white"></div>
                          <div className="absolute w-3 h-3 sm:w-5 sm:h-5 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                      )}
                      
                      {/* Group Indicator */}
                      {conversation.conversationType === 'group' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center border-2 border-white">
                          <FaUsers className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base group-hover:text-green-700 transition-colors">
                          {conversation.displayName}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            {formatTime(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Last Message Preview */}
                      {conversation.lastMessage && (
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs sm:text-sm text-gray-600 truncate flex-1">
                            <span className="font-medium text-gray-700">{conversation.lastMessage.sender}:</span> {conversation.lastMessage.content}
                          </p>
                        </div>
                      )}
                      
                      {/* Real-time Status Badge */}
                      <div className="flex items-center gap-2">
                        {conversation.isOnline ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            Offline
                          </span>
                        )}
                        
                        {/* Show last seen for offline users */}
                        {!conversation.isOnline && otherParticipant?.lastSeen && (
                          <span className="text-xs text-gray-400">
                            {formatLastSeen(otherParticipant.lastSeen)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            {filteredConversations.length} conversations
          </span>
          <span className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">
            HWMS Chat
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationsList;