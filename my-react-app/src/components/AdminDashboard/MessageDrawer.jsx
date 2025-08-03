// MessageDrawer.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosInstance";
import ChatWindow from "./MessageDrawer/ChatWindow";
import MessageDrawerHeader from "./MessageDrawer/MessageDrawerHeader";
import InboxList from "./MessageDrawer/InboxList";
import AdminUserList from "./MessageDrawer/AdminUserList";
import EmailForm from "./MessageDrawer/EmailForm";
import MessageDrawerTabs from "./MessageDrawer/MessageDrawerTabs";

const MessageDrawer = ({ onClose, setUnreadCount }) => {
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [attachment, setAttachment] = useState("");

  const [groupPage, setGroupPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 5;

  const fetchGrouped = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/support/grouped");
      if (res.data.success) {
        setGroups(res.data.groupedRequests);
        const totalUnread = res.data.groupedRequests.reduce(
          (acc, group) => acc + group.requests.filter((req) => req.status === "pending").length,
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

  const openChat = (user, requests) => {
    setSelectedUser(user);
    setSelectedMessages(requests);
  };

  const markAsReplied = async (messageIds) => {
    try {
      await api.post("/support/mark-as-read", { requestIds: messageIds });
      await fetchGrouped();
      const updatedGroup = groups.find((g) => g.sender.email === selectedUser.email);
      if (updatedGroup) setSelectedMessages(updatedGroup.requests);
    } catch (err) {
      console.error("❌ Failed to mark as replied", err);
    }
  };

  const sendEmailManually = async ({ attachments }) => {
  if (!emailTo || !subject || !messageBody) {
    toast.error("Please fill in all fields.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("email", emailTo);
    formData.append("subject", subject);
    formData.append("body", messageBody);

    attachments.forEach((file) => {
      formData.append("files", file); 
    });

    const res = await api.post("/email/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 200) {
      toast.success("Email sent successfully!");
      setEmailTo("");
      setSubject("");
      setMessageBody("");
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

  const paginatedGroups = groups.slice((groupPage - 1) * itemsPerPage, groupPage * itemsPerPage);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const groupTotalPages = Math.ceil(groups.length / itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="fixed right-2 bottom-4 sm:right-4 sm:bottom-20 w-[95vw] sm:w-[370px] h-[90vh] sm:h-[510px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-300 animate-slide-up">
      {!selectedUser && <MessageDrawerHeader onClose={onClose} />}

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
            <InboxList
              paginatedGroups={paginatedGroups}
              groupPage={groupPage}
              groupTotalPages={groupTotalPages}
              setGroupPage={setGroupPage}
              openChat={openChat}
            />
          )
        )}

        {activeTab === "admin" && (
          <AdminUserList
            paginatedUsers={paginatedUsers}
            userPage={userPage}
            userTotalPages={userTotalPages}
            setUserPage={setUserPage}
            makeAdmin={makeAdmin}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === "notify" && (
          <EmailForm
            emailTo={emailTo}
            subject={subject}
            messageBody={messageBody}
            setEmailTo={setEmailTo}
            setSubject={setSubject}
            setMessageBody={setMessageBody}
            sendEmailManually={sendEmailManually}
          />
        )}
      </div>

      <MessageDrawerTabs activeTab={activeTab} setActiveTab={setActiveTab} fetchUsers={fetchUsers} />
    </div>
  );
};

export default MessageDrawer;
