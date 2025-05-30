import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import teamColors from '../../constants/teamColors';

const FLOOR_LABELS = {
  14: 'Floor 14',
  30: 'Floor 30',
  31: 'Floor 31',
  32: 'Floor 32',
};

const UNUSED_COLOR = '#B3B0B3';  // light gray

function getFloorFromDetails(details) {//Extracts floor number from a booking detail string
  const match = details.match(/Floor (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function getTeamFromBooking(booking) {//returns the team name from the booking object
  return booking.team;
}

function getFloorUsageDataFromBookings(bookings, totalDesksPerFloor) {
  // Aggregate by floor and team
  const floorTeamCounts = {};
  const floorTotals = { 14: 0, 30: 0, 31: 0, 32: 0 };

  bookings.forEach(booking => {
    const floor = getFloorFromDetails(booking.details);
    const team = getTeamFromBooking(booking);
    if ([14, 30, 31, 32].includes(floor) && team) {
      floorTeamCounts[floor] = floorTeamCounts[floor] || {};
      floorTeamCounts[floor][team] = (floorTeamCounts[floor][team] || 0) + 1;
      floorTotals[floor]++;
    }
  });

  // Build chart data
  return [14, 30, 31, 32].map(floor => {
    const total = totalDesksPerFloor[floor] || 1;
    const usedByTeam = floorTeamCounts[floor] || {};
    const data = {
      floor: FLOOR_LABELS[floor],
      Unused: 100 - (floorTotals[floor] / total) * 100,
      totalUsed: (floorTotals[floor] / total) * 100,
    };
    Object.keys(usedByTeam).forEach(team => {
      data[team] = (usedByTeam[team] / total) * 100;
    });
    return data;
  });
}

const FloorUsageChart = ({ bookings, totalDesksPerFloor }) => {
  const chartData = getFloorUsageDataFromBookings(bookings, totalDesksPerFloor);

  // Get all teams present in the data
  const allTeams = Array.from(
    new Set(
      bookings
        .map(b => b.team)
        .filter(Boolean)
    )
  );

  // Find the last team for each floor to attach the usage label
  const getLastTeam = (data) => {
    const teams = Object.keys(data).filter(key => key.startsWith('Team '));
    return teams[teams.length - 1];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 h-[340px] flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">How often are desks being used on average?</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          barCategoryGap="20%"
        >
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <YAxis
            dataKey="floor"
            type="category"
            tick={{ fontWeight: 700, fontSize: 13 }}
          />
          <Tooltip formatter={v => `${v.toFixed(2)}%`} />
          {allTeams.map(team => (
            <Bar key={team} dataKey={team} stackId="a" fill={teamColors[team] || '#888'}>
              {/* Only add the usage label to the last team bar */}
              {team === allTeams[allTeams.length - 1] && (
                <LabelList
                  dataKey="totalUsed"
                  position="right"
                  formatter={v => `${v.toFixed(2)}%`}
                  style={{ fontWeight: 700, fontSize: 14, fill: '#444' }}
                />
              )}
            </Bar>
          ))}
          <Bar dataKey="Unused" stackId="a" fill={UNUSED_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FloorUsageChart;
