import React from 'react';

const RecentBookingsTable = ({ bookings }) => {
  
  const recentBookings = bookings.slice(0, 10);// Limit to the most recent 10 bookings

  console.log('All Bookings:', bookings);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER NAME</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TEAM</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentBookings.map((booking, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {booking.user ? booking.user.username : 'Unknown User'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.team}</td>
              <td className="px-6 py-4 whitespace-nowrap">{booking.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(booking.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookingsTable; 