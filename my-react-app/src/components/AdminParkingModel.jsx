import React, { useState, useMemo } from 'react';

const renderData = (data, excludeKeys = []) => {
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span>{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-inside ml-4">
        {data.map((item, idx) => (
          <li key={idx}>{renderData(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object' && data !== null) {
    return (
      <div className="ml-2">
        {Object.entries(data)
          .filter(([key]) => !excludeKeys.includes(key)) // Filter out excluded keys
          .map(([key, value]) => (
            <div key={key} className="mb-1">
              <strong>{key}:</strong> {renderData(value)}
            </div>
          ))}
      </div>
    );
  }

  return <span>Unknown data format</span>;
};

const AdminParkingModel = ({ data, onClose }) => {
  // NEW: Search state for usernames
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if this is paginated username filter data
  const isPaginatedData = data && data.pagination && data.showPagination !== undefined;
  
  // NEW: Check if this is usernames list data
  const isUsernamesData = data && data.users && Array.isArray(data.users) && data.totalUsers !== undefined;
  
  // Keys to exclude from rendering (pagination-related data)
  const excludeKeys = ['pagination', 'showPagination', 'paginationControls'];

  // NEW: Filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!isUsernamesData || !searchTerm.trim()) {
      return data?.users || [];
    }
    
    return data.users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.users, searchTerm, isUsernamesData]);

  // NEW: Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // NEW: Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-600 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-green-900">Results</h2>

        {/* NEW: Search bar for usernames list */}
        {isUsernamesData && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by first name or username..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {searchTerm ? (
                  <span className="font-medium text-green-700">
                    {filteredUsers.length} of {data.totalUsers} users
                  </span>
                ) : (
                  <span>{data.totalUsers} total users</span>
                )}
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs text-gray-500">
                💡 Tip: Search works for both first names and usernames
              </div>
            )}
          </div>
        )}

        {/* Show pagination info if available */}
        {isPaginatedData && data.pagination && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="text-sm text-blue-800">
              <strong>📄 Page Info:</strong> Showing {((data.pagination.currentPage - 1) * data.pagination.itemsPerPage) + 1} to {Math.min(data.pagination.currentPage * data.pagination.itemsPerPage, data.pagination.totalItems)} of {data.pagination.totalItems} total items (Page {data.pagination.currentPage} of {data.pagination.totalPages})
            </div>
          </div>
        )}

        {/* Render the main data */}
        <div className="text-sm text-gray-800 whitespace-normal">
          {isUsernamesData ? (
            // NEW: Custom rendering for usernames with search
            <div>
              <div className="mb-2">
                <strong>totalUsers:</strong> {data.totalUsers}
              </div>
              <div className="mb-1">
                <strong>users:</strong>
                <div className="ml-2 max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    <ul className="list-disc list-inside ml-4">
                      {filteredUsers.map((user, idx) => (
                        <li key={idx} className="mb-1">
                          <div className="inline-block">
                            <div><strong>displayName:</strong> {user.displayName}</div>
                            <div className="ml-2 text-gray-600">
                              <div><strong>firstName:</strong> {user.firstName}</div>
                              <div><strong>username:</strong> {user.username}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 italic ml-4 py-2">
                      No users found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Original rendering for other data types
            renderData(data, excludeKeys)
          )}
        </div>

        {/* Show pagination controls if available */}
        {isPaginatedData && data.paginationControls && data.pagination.totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-center items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={data.paginationControls.onPrevPage}
                disabled={!data.pagination.hasPrevPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !data.pagination.hasPrevPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>

              {/* Page Info */}
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </span>

              {/* Next Button */}
              <button
                onClick={data.paginationControls.onNextPage}
                disabled={!data.pagination.hasNextPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !data.pagination.hasNextPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>

            {/* Jump to Page Input (only show if more than 3 pages) */}
            {data.pagination.totalPages > 3 && (
              <div className="flex justify-center items-center space-x-2 mt-3">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={data.pagination.totalPages}
                  defaultValue={data.pagination.currentPage}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= data.pagination.totalPages) {
                        data.paginationControls.onPageChange(page);
                      }
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-500">(Press Enter)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminParkingModel;