import { FaUserCircle } from "react-icons/fa";

const InboxList = ({ paginatedGroups, groupPage, groupTotalPages, setGroupPage, openChat }) => (
  <div className="px-3 py-2 space-y-2">
    {paginatedGroups.length === 0 ? (
      <p className="text-sm text-center text-gray-500 mt-8">
        {localStorage.getItem("token") ? "No messages found." : "Unauthorized access. Please log in."}
      </p>
    ) : (
      paginatedGroups.map((group) => (
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
    {groupTotalPages > 1 && (
      <div className="flex justify-between items-center px-1 pt-3 text-xs text-gray-600">
        <button onClick={() => setGroupPage((p) => Math.max(p - 1, 1))} disabled={groupPage === 1} className="px-2 py-1 rounded hover:bg-gray-200 disabled:text-gray-300">← Prev</button>
        <span>Page {groupPage} of {groupTotalPages}</span>
        <button onClick={() => setGroupPage((p) => Math.min(p + 1, groupTotalPages))} disabled={groupPage === groupTotalPages} className="px-2 py-1 rounded hover:bg-gray-200 disabled:text-gray-300">Next →</button>
      </div>
    )}
  </div>
);

export default InboxList;
