import React from 'react';

const ViewToggle = ({ showAllBookings, onToggle }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {showAllBookings ? 'All bookings' : 'Upcoming + last 30 days bookings'}
        </span>
      </div>

      <button
        onClick={onToggle}
        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {showAllBookings ? 'Show Recent Only' : 'View All'}
      </button>
    </div>
  );
};

export default ViewToggle;
