const MessageDrawerHeader = ({ onClose }) => (
  <div className="flex justify-between items-center p-4 border-b bg-gray-50">
    <h2 className="text-lg font-bold text-gray-800">📬 Admin Inbox</h2>
    <button className="text-sm text-gray-400 hover:text-red-500" onClick={onClose}>✖</button>
  </div>
);

export default MessageDrawerHeader;
