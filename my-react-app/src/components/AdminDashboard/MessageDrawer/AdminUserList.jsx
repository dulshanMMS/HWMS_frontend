import React from "react";

const AdminUserList = ({
  paginatedUsers,
  userPage,
  userTotalPages,
  setUserPage,
  makeAdmin,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="p-3 space-y-2 overflow-y-auto text-sm">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 text-sm"
      />

      {paginatedUsers.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No users found.</p>
      ) : (
        paginatedUsers.map((user) => (
          <div
            key={user._id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </p>
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

      {userTotalPages > 1 && (
        <div className="flex justify-between items-center pt-3 text-xs text-gray-600">
          <button
            onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
            disabled={userPage === 1}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:text-gray-300"
          >
            ← Prev
          </button>
          <span>
            Page {userPage} of {userTotalPages}
          </span>
          <button
            onClick={() => setUserPage((p) => Math.min(p + 1, userTotalPages))}
            disabled={userPage === userTotalPages}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:text-gray-300"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
