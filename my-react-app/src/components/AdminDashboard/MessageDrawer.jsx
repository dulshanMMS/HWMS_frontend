import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

// Chat window interface (replaces dropdown view)
const ChatWindow = ({ user, messages, onBack }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 bg-green-600 text-white">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-3 bg-white p-2 rounded shadow-sm text-sm text-gray-800">
            <p className="mb-1 font-medium">{msg.subject}</p>
            <p>{msg.message}</p>
    
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleString()}
              </span>

              <span className={`text-xs px-2 py-1 rounded-full ${
                msg.status === "replied"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}>
                {msg.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t text-center text-sm text-gray-400">
        Reply feature coming soon 💬
      </div>
    </div>
  );
};

const MessageDrawer = ({ onClose }) => {
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGrouped = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/support/grouped", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (res.data.success) {
          setGroups(res.data.groupedRequests);
        }
      } catch (err) {
        console.error("Error fetching grouped support requests", err);
      }
    };
    fetchGrouped();
  }, []);

  const openChat = async (user, requests) => {
    setSelectedUser(user);
    setSelectedMessages(requests);

    // Optional: filter requests that are still pending
    const unreadIds = requests
      .filter((r) => r.status === "pending")
      .map((r) => r._id);

    if (unreadIds.length > 0) {
      try {
        await axios.post(
          "/api/support/mark-as-read",
          { requestIds: unreadIds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🔁 Refresh the grouped requests after marking as read
        const res = await axios.get("/api/support/grouped", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          setGroups(res.data.groupedRequests);
        }
      } catch (err) {
        console.error("❌ Failed to mark requests as read:", err);
      }
    }
  };

  return (
    <div className="fixed right-4 bottom-20 w-[360px] h-[500px] bg-white rounded-xl shadow-xl z-50 overflow-hidden flex flex-col border border-gray-200">
      {/* Header */}
      {!selectedUser && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Inbox</h2>
          <button
            className="text-sm text-gray-400 hover:text-red-500"
            onClick={onClose}
          >
            ✖
          </button>
        </div>
      )}

      {/* Chat List or Chat Window */}
      <div className="flex-1 overflow-y-auto">
        {selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={selectedMessages}
            onBack={() => setSelectedUser(null)}
          />
        ) : (
          <div className="px-3 py-2">
            {groups.map((group) => (
              <button
                key={group.sender.email}
                onClick={() => openChat(group.sender, group.requests)}
                className="w-full flex items-center gap-3 p-3 mb-2 rounded bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaUserCircle className="text-2xl text-green-600" />
                <div className="flex-1 text-left">
                  <p className="font-semibold">
                    {group.sender.firstName || group.sender.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {group.requests.filter(r => r.status === "pending").length} new message(s)
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDrawer;
