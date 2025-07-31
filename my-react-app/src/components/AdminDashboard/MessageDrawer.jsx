import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosInstance"; 
import { FaUserCircle } from "react-icons/fa";
import ChatWindow from "./ChatWindow";

const MessageDrawer = ({ onClose, setUnreadCount }) => {
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox"); 
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailTo, setEmailTo] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const fetchGrouped = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/support/grouped");
      if (res.data.success) {
        setGroups(res.data.groupedRequests);
        const totalUnread = res.data.groupedRequests.reduce(
          (acc, group) =>
            acc + group.requests.filter((req) => req.status === "pending").length,
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error("❌ Error fetching grouped support requests", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/user/users");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
    }
  };

  const makeAdmin = async (userId) => {
    try {
      const res = await api.patch(`/user/users/${userId}/role`);
      toast.success("User promoted to admin!");
      fetchUsers();
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("❌ Failed to update user role:", error);
    }
  };

  useEffect(() => {
    fetchGrouped();
  }, []);

  const openChat = async (user, requests) => {
    setSelectedUser(user);
    setSelectedMessages(requests);
  };

  const markAsReplied = async (messageIds) => {
    try {
      await api.post("/support/mark-as-read", { requestIds: messageIds });
      await fetchGrouped(); 
      const updatedGroup = groups.find(
        (g) => g.sender.email === selectedUser.email
      );
      if (updatedGroup) setSelectedMessages(updatedGroup.requests);
    } catch (err) {
      console.error("❌ Failed to mark as replied", err);
    }
  };

  const sendEmailManually = async () => {
    if (!emailTo || !subject || !messageBody) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const res = await api.post("/email/send", {
        email: emailTo,
        subject,
        body: messageBody
      });

      if (res.ok || res.status === 200) {
        toast.success("Email sent successfully!");
        setEmailTo('');
        setSubject('');
        setMessageBody('');
      } else {
        toast.error("Failed to send email.");
      }
    } catch (err) {
      console.error("❌ Email send error:", err);
      toast.error("Something went wrong.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {activeTab === "inbox" && (
          selectedUser ? (
            <ChatWindow
              user={selectedUser}
              messages={selectedMessages}
              onBack={() => setSelectedUser(null)}
              onMarkAsReplied={markAsReplied}
            />
          ) : (
            <div className="px-3 py-2 space-y-2">
              {groups.length === 0 ? (
                <p className="text-sm text-center text-gray-500 mt-8">
                  {localStorage.getItem("token") ? "No messages found." : "Unauthorized access. Please log in."}
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
                        {group.requests.filter((r) => r.status === "pending").length || 0} new message(s)
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )
        )}

        {activeTab === "admin" && (
          <div className="p-3 space-y-2 overflow-y-auto text-sm">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3 text-sm"
            />
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center mt-6">No users found.</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="border p-3 rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">Role: {user.role}</p>
                  </div>
                  {user.role !== "admin" && (
                    <button
                      onClick={() => makeAdmin(user._id)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notify" && (
          <div className="p-4 space-y-3 text-sm">
            <h3 className="text-lg font-semibold text-gray-800">📤 Send Custom Email</h3>

            <input
              type="email"
              placeholder="Recipient email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />

            <textarea
              placeholder="Message body"
              rows={6}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded resize-none"
            />

            <button
              onClick={sendEmailManually}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Send Email
            </button>
          </div>
        )}
      </div>

      <div className="flex border-t bg-gray-100">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "inbox" ? "bg-white text-green-700" : "text-gray-600"}`}
        >
          📬 Inbox
        </button>
        <button
          onClick={() => {
            setActiveTab("admin");
            fetchUsers();
          }}
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "admin" ? "bg-white text-green-700" : "text-gray-600"}`}
        >
          👤 Make Admin
        </button>
        <button
          onClick={() => {
            setActiveTab("notify");
            fetchUsers(); // reuse same users
          }}
          className={`flex-1 py-2 text-sm font-medium ${activeTab === "notify" ? "bg-white text-green-700" : "text-gray-600"}`}
        >
          📤 Notify
        </button>
      </div>
    </div>
  );
};

export default MessageDrawer;
