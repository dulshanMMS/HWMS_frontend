import React from 'react';

const SeatBookingStats = ({ totalBookings, teamInfo, loading }) => (
  <div className="mb-8">
    <h2 className="text-sm font-medium text-gray-600 mb-2">Quick Stats</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <p className="text-sm text-gray-600">Your Total Seat Bookings:</p>
        <p className="text-3xl font-bold">
          {loading ? 'Loading...' : totalBookings}
        </p>
      </div>
      {teamInfo && (
        <div className="bg-white p-4 border rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Team:</p>
          <p className="text-xl font-bold flex items-center">
            <span 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: teamInfo.teamColor }}
            ></span>
            {teamInfo.teamName}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default SeatBookingStats;