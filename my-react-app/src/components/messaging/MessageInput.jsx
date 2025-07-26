import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaReply, FaTimes, FaSmile, FaExclamationTriangle } from 'react-icons/fa';

const MessageInput = ({ 
  onSendMessage, 
  replyingTo, 
  onCancelReply, 
  onTyping, 
  onStopTyping,
  isConnected = true,
  disabled = false 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messageInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !isConnected) return;

    setIsSending(true);
    
    try {
      const success = await onSendMessage(newMessage);
      if (success) {
        setNewMessage('');
        messageInputRef.current?.focus();
        
        // Stop typing indicator when message is sent
        if (onStopTyping) {
          onStopTyping();
        }
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Trigger typing indicator when user types
    if (onTyping && e.target.value.trim() && isConnected) {
      onTyping();
    }
  };

  const handleInputBlur = () => {
    // Stop typing indicator when input loses focus
    if (onStopTyping) {
      onStopTyping();
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

      {/* Connection status warning */}
      {!isConnected && (
        <div className="bg-red-50 border-b border-red-200 px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2 text-red-700">
            <FaExclamationTriangle className="text-sm" />
            <span className="text-xs sm:text-sm font-medium">
              Connection lost. Messages will be sent when reconnected.
            </span>
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="p-3 sm:p-4">
        <div className="flex items-end space-x-2 sm:space-x-3">
          {/* Message input container */}
          <div className="flex-1 relative">
            {/* Input field */}
            <div className={`relative rounded-xl sm:rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
              !isConnected || disabled
                ? 'bg-gray-100 border-gray-300'
                : 'bg-gray-50 border-gray-200 focus-within:border-green-400 focus-within:bg-white'
            }`}>
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                disabled={disabled || !isConnected}
                placeholder={
                  !isConnected 
                    ? "Reconnecting..." 
                    : disabled 
                      ? "Unable to send messages"
                      : "Type your message..."
                }
                rows={1}
                className={`w-full p-3 sm:p-4 pr-10 sm:pr-12 bg-transparent rounded-xl sm:rounded-2xl resize-none focus:outline-none max-h-24 sm:max-h-32 scrollbar-thin scrollbar-thumb-gray-300 text-sm sm:text-base ${
                  !isConnected || disabled
                    ? 'text-gray-500 placeholder-gray-400 cursor-not-allowed'
                    : 'text-gray-800 placeholder-gray-500'
                }`}
                style={{
                  minHeight: '44px',
                  maxHeight: '128px',
                  overflowY: newMessage.length > 100 ? 'auto' : 'hidden'
                }}
              />
              
              {/* Emoji button */}
              <button 
                className={`absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 transition-colors duration-200 ${
                  !isConnected || disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                disabled={disabled || !isConnected}
              >
                <FaSmile className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Character counter for long messages */}
            {newMessage.length > 150 && (
              <div className="absolute -top-5 sm:-top-6 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                <span className={newMessage.length > 1800 ? 'text-red-500' : ''}>
                  {newMessage.length}/2000
                </span>
              </div>
            )}

            {/* Real-time connection indicator */}
            {!isConnected && (
              <div className="absolute -top-2 left-2 flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Offline</span>
              </div>
            )}
          </div>

          {/* Send button with enhanced states */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || !isConnected || disabled}
            className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 shadow-lg font-medium ${
              !newMessage.trim() || isSending || !isConnected || disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl group transform'
            }`}
          >
            {isSending ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane className={`text-sm sm:text-lg transition-transform ${
                !newMessage.trim() || !isConnected || disabled 
                  ? '' 
                  : 'group-hover:translate-x-0.5'
              }`} />
            )}
          </button>
        </div>

        {/* Enhanced footer with typing indicators and connection status */}
        <div className="mt-2 sm:mt-3 px-2 flex justify-between items-center">
          {/* Connection status and typing info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {!isConnected ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>Reconnecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected</span> */}
              </div>
            )}
          </div>
          
          {/* Input hints for desktop */}
          <div className="text-xs text-gray-400 hidden sm:block">
            {!isConnected 
              ? 'Messages will send when reconnected'
              : 'Press Enter to send • Shift+Enter for new line'
            }
          </div>
        </div>

        {/* Message queue indicator for offline messages */}
        {!isConnected && newMessage.trim() && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700">
              <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Message will be sent when connection is restored</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;