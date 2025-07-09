import React from 'react';

const teamColors = {
  "Team A": "#60a5fa",
  "Team B": "#a78bfa",
  "Team C": "#fb923c",
  "Team D": "#fde68a",
  "Team E": "#4ade80",
  "Team F": "#f472b6",
  "Team G": "#818cf8",
  "Team H": "#f87171",
  "Team I": "#2dd4bf",
  "Team J": "#bef264",
  "Team K": "#a16207",
  "Team L": "#a8a29e",
  "Team M": "#dc2626",
  "Team N": "#fbbf24",
  "Team O": "#7c3aed",
};

const ProgramBookingsTable = ({ data }) => {
  const transformProgramBookings = () => {
    if (!data?.programBookings?.length) return [];
    
    return data.programBookings.map(booking => {
      const bookingData = {
        ...booking,
        month: new Date(booking.month).toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short'
        })
      };

      if (booking.SENG !== undefined) bookingData['Team A'] = booking.SENG;
      if (booking.BM !== undefined) bookingData['Team B'] = booking.BM;
      if (booking.IT !== undefined) bookingData['Team C'] = booking.IT;

      delete bookingData.SENG;
      delete bookingData.BM;
      delete bookingData.IT;

      return bookingData;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Program Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              {Object.keys(teamColors).map(team => (
                <th key={team} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{team}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transformProgramBookings().map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.month}</td>
                {Object.keys(teamColors).map(team => (
                  <td key={team} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row[team] || 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramBookingsTable; 