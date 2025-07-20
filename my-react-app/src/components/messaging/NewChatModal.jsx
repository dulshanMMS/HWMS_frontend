import React, { useState } from 'react';
import { FaTimes, FaSearch, FaUsers } from 'react-icons/fa';
import UserSearchModal from './UserSearchModal';

const NewChatModal = ({ onClose, onCreateConversation, token }) => {
  const [showUserSearch, setShowUserSearch] = useState(false);

  const handleCreateConversation = async (participantIds, type, groupName) => {
    const success = await onCreateConversation(participantIds, type, groupName);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowUserSearch(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">New Conversation</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {!showUserSearch ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <FaSearch className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Find Colleagues</h4>
                    <p className="text-sm text-gray-500">Search and message your teammates</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log('Team chat creation not implemented yet');
                }}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <FaUsers className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Team Chat</h4>
                    <p className="text-sm text-gray-500">Start a group conversation</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <UserSearchModal
              token={token}
              onCreateConversation={handleCreateConversation}
              onBack={() => setShowUserSearch(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;