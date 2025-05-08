import React from 'react';
import { FaUser } from 'react-icons/fa';
import teamColors from '../constants/teamColors';

const PROGRAM_TO_TEAM = {
  SENG: 'Team A',
  BM: 'Team B',
  IT: 'Team C',
  TEAM4: 'Team D',
  TEAM5: 'Team E',
  TEAM6: 'Team F',
  TEAM7: 'Team G',
  TEAM8: 'Team H',
  TEAM9: 'Team I',
  TEAM10: 'Team J',
  TEAM11: 'Team K',
  TEAM12: 'Team L',
  TEAM13: 'Team M',
  TEAM14: 'Team N',
  TEAM15: 'Team O',
};

const UserBookingsTable = ({ bookings }) => {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROGRAM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking, idx) => {
              // Map program to team and color
              const team = PROGRAM_TO_TEAM[booking.program] || booking.program;
              const color = teamColors[team] || '#9E9E9E';
              return (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center rounded-full h-8 w-8"
                      style={{ backgroundColor: color }}
                    >
                      <FaUser className="text-white" />
                    </span>
                    <span className="font-semibold text-gray-800">{booking.username}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="font-semibold" style={{ color }}>{booking.program}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserBookingsTable;
