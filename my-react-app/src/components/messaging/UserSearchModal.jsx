import React, { useState } from 'react';
import { FaArrowLeft, FaSearch, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const UserSearchModal = ({ token, onCreateConversation, onBack }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/search/users?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      // Mock users for demo if API not ready
      setSearchResults([
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe', 
          username: 'john.doe',
          email: 'john@company.com',
          profilePhoto: 'https://i.pravatar.cc/40?img=1',
          displayName: 'John Doe',
          teamInfo: { name: 'Development Team' }
        },
        {
          _id: '2',
          firstName: 'Sarah',
          lastName: 'Wilson',
          username: 'sarah.wilson',
          email: 'sarah@company.com', 
          profilePhoto: 'https://i.pravatar.cc/40?img=2',
          displayName: 'Sarah Wilson',
          teamInfo: { name: 'Design Team' }
        }
      ].filter(user => 
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      ));
    }
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;
    
    const participantIds = selectedUsers.map(u => u._id);
    const type = selectedUsers.length > 1 ? 'group' : 'direct';
    
    onCreateConversation(participantIds, type, groupName);
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => {
          onBack();
          setSearchResults([]);
          setSelectedUsers([]);
          setGroupName('');
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* User Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name, username, or email..."
          onChange={(e) => searchUsers(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          autoFocus
        />
      </div>
      
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Selected ({selectedUsers.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <div
                key={user._id}
                className="flex items-center space-x-2 bg-green-100 rounded-full px-3 py-2"
              >
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </span>
                </div>
                <span className="text-sm font-medium text-green-800">{user.displayName}</span>
                <button
                  onClick={() => toggleUserSelection(user)}
                  className="text-green-600 hover:text-green-800 ml-1"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {selectedUsers.length > 1 && (
            <input
              type="text"
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}
          
          <button
            onClick={handleCreateConversation}
            className="w-full p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
          >
            Start Conversation ({selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'})
          </button>
        </div>
      )}
      
      {/* Search Results */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {searchResults.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="mx-auto text-gray-300 text-3xl mb-3" />
            <p className="text-gray-500">Search for colleagues to start messaging</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Search Results ({searchResults.length}):</p>
            {searchResults.map(user => (
              <div
                key={user._id}
                onClick={() => toggleUserSelection(user)}
                className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedUsers.some(u => u._id === user._id)
                    ? 'bg-green-50 border-green-300 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                      </span>
                    </div>
                    {selectedUsers.some(u => u._id === user._id) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    {user.teamInfo && (
                      <p className="text-xs text-gray-400 truncate">
                        Team: {user.teamInfo.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-gray-400 mt-1">Online</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchModal;