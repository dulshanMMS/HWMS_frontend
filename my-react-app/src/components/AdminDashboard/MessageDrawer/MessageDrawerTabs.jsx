const MessageDrawerTabs = ({ activeTab, setActiveTab, fetchUsers }) => (
  <div className="flex border-t bg-gray-100">
    <button onClick={() => setActiveTab("inbox")} className={`flex-1 py-2 text-sm font-medium ${activeTab === "inbox" ? "bg-white text-green-700" : "text-gray-600"}`}>📬 Inbox</button>
    <button onClick={() => { setActiveTab("admin"); fetchUsers(); }} className={`flex-1 py-2 text-sm font-medium ${activeTab === "admin" ? "bg-white text-green-700" : "text-gray-600"}`}>👤 Make Admin</button>
    <button onClick={() => { setActiveTab("notify"); fetchUsers(); }} className={`flex-1 py-2 text-sm font-medium ${activeTab === "notify" ? "bg-white text-green-700" : "text-gray-600"}`}>📤 Notify</button>
  </div>
);

export default MessageDrawerTabs;
