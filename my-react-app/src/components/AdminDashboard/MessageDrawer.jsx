import { useEffect, useState } from "react";
import api from "../../api/axiosInstance"; 
import { FaUserCircle } from "react-icons/fa";

// Chat window interface
const ChatWindow = ({ user, messages, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 animate-fade-in">
      <div className="flex items-center justify-between p-3 bg-green-700 text-white shadow">
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-2xl" />
          <span className="font-semibold">
            {user.firstName || user.email}
          </span>
        </div>
        <button onClick={onBack} className="text-sm hover:underline">
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm text-gray-800"
          >
            <p className="font-semibold text-green-800">{msg.subject}</p>
            <p className="mt-1">{msg.message}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  msg.status === "replied"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {msg.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t text-center text-xs text-gray-500 italic">
        ✉️ Reply feature coming soon...
      </div>
    </div>
  );
};

const MessageDrawer = ({ onClose }) => {
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);

  useEffect(() => {
    const fetchGrouped = async () => {
      try {
        const res = await api.get("/support/grouped");
        if (res.data.success) {
          setGroups(res.data.groupedRequests);
        }
      } catch (err) {
        console.error("❌ Error fetching grouped support requests", err);
      }
    };

    fetchGrouped();
  }, []);

  const openChat = async (user, requests) => {
    setSelectedUser(user);
    setSelectedMessages(requests);

    const unreadIds = requests
      .filter((r) => r.status === "pending")
      .map((r) => r._id);

    if (unreadIds.length > 0) {
      try {
        await api.post("/support/mark-as-read", { requestIds: unreadIds });
        const res = await api.get("/support/grouped");
        if (res.data?.success && Array.isArray(res.data.groupedRequests)) {
          setGroups(res.data.groupedRequests);
        } else {
          setGroups([]);
          console.warn("No grouped support requests found.");
        }
      } catch (err) {
        console.error("❌ Failed to mark requests as read:", err);
      }
    }
  };

  return (
    <div className="fixed right-4 bottom-20 w-[370px] h-[510px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-300 animate-slide-up">
      {!selectedUser && (
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">📬 Admin Inbox</h2>
          <button
            className="text-sm text-gray-400 hover:text-red-500"
            onClick={onClose}
          >
            ✖
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={selectedMessages}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="px-3 py-2 space-y-2">
            {groups.length === 0 ? (
              <p className="text-sm text-center text-gray-500 mt-8">
                No messages found.
              </p>
            ) : (
              groups.map((group) => (
                <button
                  key={group.sender.email}
                  onClick={() => openChat(group.sender, group.requests)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border hover:shadow transition"
                >
                  <FaUserCircle className="text-2xl text-green-600" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">
                      {group.sender.firstName || group.sender.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {group.requests.filter((r) => r.status === "pending")
                        .length || 0}{" "}
                      new message(s)
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDrawer;
