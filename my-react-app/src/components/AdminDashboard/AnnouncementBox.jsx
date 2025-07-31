import { useEffect, useRef } from "react";

/**
 * Smart, styled Announcement input with send functionality.
 */
const AnnouncementBox = ({ announcement, setAnnouncement, onSend }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    boxRef.current?.classList.add("animate-fade-in");
  }, []);

  return (
    <div
      ref={boxRef}
      className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 transition duration-300"
    >
      <h2 className="text-lg font-bold text-gray-800 mb-3">📢 Special Announcements</h2>
      
      <textarea
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        placeholder="Type your announcement here..."
        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none h-28 text-gray-700"
      />
      
      <div className="text-right mt-4">
        <button
          onClick={onSend}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition active:scale-95"
        >
           Send
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBox;
