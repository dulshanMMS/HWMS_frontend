import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaReply, FaTimes, FaSmile } from 'react-icons/fa';

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
      console.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50">
      {/* Reply indicator with enhanced design */}
      {replyingTo && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-200/50 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-full">
                <FaReply className="text-white text-xs sm:text-sm" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800">Replying to message</p>
                <p className="text-xs text-blue-600 truncate max-w-xs sm:max-w-md">
                  "{replyingTo.content.substring(0, 50)}..."
                </p>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
            >
              <FaTimes className="text-xs sm:text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="p-3 sm:p-4">
        <div className="flex items-end space-x-2 sm:space-x-3">
          {/* Message input container */}
          <div className="flex-1 relative">
            {/* Input field */}
            <div className="relative bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 focus-within:border-green-400 focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full p-3 sm:p-4 pr-10 sm:pr-12 bg-transparent rounded-xl sm:rounded-2xl resize-none focus:outline-none text-gray-800 placeholder-gray-500 max-h-24 sm:max-h-32 scrollbar-thin scrollbar-thumb-gray-300 text-sm sm:text-base"
                style={{
                  minHeight: '44px',
                  maxHeight: '128px',
                  overflowY: newMessage.length > 100 ? 'auto' : 'hidden'
                }}
              />
              
              {/* Emoji button */}
              <button className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 text-gray-400 hover:text-yellow-500 transition-colors duration-200">
                <FaSmile className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Character counter for long messages */}
            {newMessage.length > 150 && (
              <div className="absolute -top-5 sm:-top-6 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                {newMessage.length}/2000
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2.5 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group transform"
          >
            <FaPaperPlane className="text-sm sm:text-lg group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Typing indicator space */}
        <div className="mt-2 sm:mt-3 px-2 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {/* Typing indicator would go here */}
          </div>
          
          {/* Input hints for mobile */}
          <div className="text-xs text-gray-400 hidden sm:block">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;