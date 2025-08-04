import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const MessageDrawerTabs = ({ activeTab, setActiveTab, fetchUsers }) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const superAdminEmail = "wileyhwms@test.com"; 
        if (decoded.email === superAdminEmail) {
          setIsSuperAdmin(true);
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  return (
    <div className="flex border-t bg-gray-100">
      <button
        onClick={() => setActiveTab("inbox")}
        className={`flex-1 py-2 text-sm font-medium ${
          activeTab === "inbox" ? "bg-white text-green-700" : "text-gray-600"
        }`}
      >
        📬 Inbox
      </button>

      {isSuperAdmin && (
        <button
          onClick={() => {
            setActiveTab("admin");
            fetchUsers();
          }}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "admin" ? "bg-white text-green-700" : "text-gray-600"
          }`}
        >
          👤 Make Admin
        </button>
      )}

      <button
        onClick={() => {
          setActiveTab("notify");
          fetchUsers();
        }}
        className={`flex-1 py-2 text-sm font-medium ${
          activeTab === "notify" ? "bg-white text-green-700" : "text-gray-600"
        }`}
      >
        📤 Notify
      </button>
    </div>
  );
};

export default MessageDrawerTabs;
