import React from "react";

/**
 * Textarea input and send button for special announcements.
 *
 * Current announcement text.
 * setAnnouncement - Setter for announcement text.
 * onSend - Handler to send the announcement.
 */

const AnnouncementBox = ({ announcement, setAnnouncement, onSend }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Special Announcement
    </label>
    <textarea
      value={announcement}
      onChange={(e) => setAnnouncement(e.target.value)}
      placeholder="Type your announcement here..."
      className="w-full p-2 border rounded resize-none h-28 mb-2"
    />
    <div className="text-right mt-2">
      <button
        onClick={onSend}
        className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Send
      </button>
    </div>
  </div>
);

export default AnnouncementBox;