import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaReply, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import EmojiPicker from './EmojiPicker';

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

  // ✅ Character limit constants
  const MAX_CHARACTERS = 2000;
  const WARNING_THRESHOLD = 1800; // Show warning at 90%

  // ✅ Calculate character count and validation
  const characterCount = newMessage.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const isNearLimit = characterCount > WARNING_THRESHOLD;
  const remainingChars = MAX_CHARACTERS - characterCount;

  // ✅ Enhanced send validation
  const canSend = !newMessage.trim() || 
                  isSending || 
                  !isConnected || 
                  disabled || 
                  isOverLimit; // ✅ NEW: Disable if over limit

  const handleSendMessage = async () => {
    if (canSend) return; // ✅ Block sending if conditions not met

    setIsSending(true);
    
    try {
      const success = await onSendMessage(newMessage);
      if (success) {
        setNewMessage('');
        messageInputRef.current?.focus();
        
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
      if (!canSend) { // ✅ Only send if conditions are met
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // ✅ Optional: Hard limit - prevent typing beyond limit
    // if (value.length <= MAX_CHARACTERS) {
    //   setNewMessage(value);
    // }
    
    // ✅ Or allow typing but show warning (current approach)
    setNewMessage(value);
    
    if (onTyping && value.trim() && isConnected && !isOverLimit) {
      onTyping();
    }
  };

  const handleInputBlur = () => {
    if (onStopTyping) {
      onStopTyping();
    }
  };

  // ✅ Get appropriate color for character counter
  const getCounterColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (isNearLimit) return 'text-orange-600';
    return 'text-gray-500';
  };

  // ✅ Get progress bar color
  const getProgressBarColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50">
      {/* Reply indicator */}
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

      {/* ✅ Character limit warning banner */}
      {isOverLimit && (
        <div className="bg-red-50 border-b border-red-200 px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2 text-red-700">
            <FaExclamationTriangle className="text-sm animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">
              Message too long! Please reduce by {Math.abs(remainingChars)} characters.
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
                : isOverLimit
                  ? 'bg-red-50 border-red-400 focus-within:border-red-500'
                  : isNearLimit
                    ? 'bg-orange-50 border-orange-300 focus-within:border-orange-400'
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
                      : isOverLimit
                        ? "Message too long - please shorten..."
                        : "Type your message..."
                }
                rows={1}
                className={`w-full p-3 sm:p-4 pr-10 sm:pr-12 bg-transparent rounded-xl sm:rounded-2xl resize-none focus:outline-none max-h-24 sm:max-h-32 scrollbar-thin scrollbar-thumb-gray-300 text-sm sm:text-base ${
                  !isConnected || disabled
                    ? 'text-gray-500 placeholder-gray-400 cursor-not-allowed'
                    : isOverLimit
                      ? 'text-red-700 placeholder-red-400'
                      : 'text-gray-800 placeholder-gray-500'
                }`}
                style={{
                  minHeight: '44px',
                  maxHeight: '128px',
                  overflowY: newMessage.length > 100 ? 'auto' : 'hidden'
                }}
              />
              
              {/* Emoji button */}
              <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3">
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    const newLength = newMessage.length + emoji.length;
                    if (newLength <= MAX_CHARACTERS || !isOverLimit) {
                      setNewMessage(prev => prev + emoji);
                      messageInputRef.current?.focus();
                    }
                  }}
                  className={disabled || !isConnected ? 'pointer-events-none opacity-50' : ''}
                />
              </div>
            </div>

            {/* ✅ Enhanced character counter with progress bar */}
            {newMessage.length > 0 && (
              <div className="absolute -top-8 sm:-top-10 right-2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200">
                <div className="flex items-center gap-2">
                  {/* Progress bar */}
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
                      style={{ 
                        width: `${Math.min((characterCount / MAX_CHARACTERS) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  {/* Character count */}
                  <span className={`text-xs font-medium ${getCounterColor()}`}>
                    {isOverLimit ? (
                      <>-{Math.abs(remainingChars)}</>
                    ) : (
                      <>{characterCount}/{MAX_CHARACTERS}</>
                    )}
                  </span>
                  
                  {/* Warning icon */}
                  {isOverLimit && (
                    <FaExclamationTriangle className="text-red-500 text-xs animate-pulse" />
                  )}
                </div>
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

          {/* ✅ Enhanced send button with character limit validation */}
          <button
            onClick={handleSendMessage}
            disabled={canSend}
            className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 shadow-lg font-medium relative group ${
              canSend
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl transform'
            }`}
            title={
              isOverLimit 
                ? `Message too long by ${Math.abs(remainingChars)} characters`
                : !newMessage.trim()
                  ? 'Enter a message'
                  : !isConnected
                    ? 'Not connected'
                    : 'Send message'
            }
          >
            {isSending ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane className={`text-sm sm:text-lg transition-transform ${
                canSend
                  ? '' 
                  : 'group-hover:translate-x-0.5'
              }`} />
            )}

            {/* ✅ Character limit indicator on button */}
            {isOverLimit && newMessage.trim() && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-white text-xs" />
              </div>
            )}
          </button>
        </div>

        {/* Enhanced footer */}
        <div className="mt-2 sm:mt-3 px-2 flex justify-between items-center">
          {/* Connection and character status */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {!isConnected ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>Reconnecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected</span>
              </div>
            )}

            {/* ✅ Character limit status */}
            {newMessage.length > WARNING_THRESHOLD && (
              <div className={`flex items-center gap-1 ${getCounterColor()}`}>
                {isOverLimit && <FaExclamationTriangle className="animate-pulse" />}
                <span>
                  {isOverLimit 
                    ? `${Math.abs(remainingChars)} over limit`
                    : `${remainingChars} left`
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Input hints */}
          <div className="text-xs text-gray-400 hidden sm:block">
            {!isConnected 
              ? 'Messages will send when reconnected'
              : isOverLimit
                ? 'Message too long to send'
                : 'Press Enter to send • Shift+Enter for new line'
            }
          </div>
        </div>

        {/* ✅ Character limit help message */}
        {isNearLimit && !isOverLimit && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <FaExclamationTriangle className="text-sm" />
              <span className="text-xs">
                Approaching character limit ({remainingChars} characters remaining)
              </span>
            </div>
          </div>
        )}

        {/* Message queue indicator for offline messages */}
        {!isConnected && newMessage.trim() && !isOverLimit && (
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