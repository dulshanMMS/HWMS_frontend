import React from 'react';

const BookingStats = ({ totalBookings, loading }) => (
  <div className="mb-8">
    <h2 className="text-sm font-medium text-gray-600 mb-2">Quick Stats</h2>
    <div className="bg-white p-4 border rounded-lg shadow-sm inline-block">
      <p className="text-sm text-gray-600">Your Total Bookings:</p>
      <p className="text-3xl font-bold">
        {loading ? 'Loading...' : totalBookings}
      </p>
    </div>
  </div>
);

export default BookingStats;
