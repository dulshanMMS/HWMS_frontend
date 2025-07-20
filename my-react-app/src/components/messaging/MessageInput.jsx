import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaReply, FaTimes } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
  const [newMessage, setNewMessage] = useState('');
  const messageInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await onSendMessage(newMessage);
    if (success) {
      setNewMessage('');
      messageInputRef.current?.focus();
    } else {
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Reply indicator */}
      {replyingTo && (
        <div className="bg-green-50 border-t border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaReply className="text-green-600" />
              <span className="text-sm text-green-800">
                Replying to: {replyingTo.content.substring(0, 50)}...
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-green-600 hover:text-green-800"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageInput;