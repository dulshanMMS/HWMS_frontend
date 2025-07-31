import React, { useState, useRef, useEffect } from 'react';
import { FaSmile, FaTimes } from 'react-icons/fa';

const EmojiPicker = ({ onEmojiSelect, className = "" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Simple emoji data - you can expand this
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Objects': ['👑', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '✨', '🔥', '💯', '✅', '❌', '⚡', '💢', '💥', '💨', '💦', '💤']
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          showPicker 
            ? 'text-yellow-600 bg-yellow-100' 
            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
        }`}
        title="Add emoji"
      >
        <FaSmile className="text-base sm:text-lg" />
      </button>

      {/* Emoji Picker Panel */}
      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
            <h3 className="font-semibold text-gray-800 text-sm">Choose an emoji</h3>
            <button
              onClick={() => setShowPicker(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Emoji Grid */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="p-3">
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors duration-150 hover:scale-110 transform"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-500 text-center">
              Click any emoji to add it to your message
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;