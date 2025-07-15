import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import axios from 'axios';

const FLOOR_LABELS = {
  14: 'Floor 14',
  30: 'Floor 30',
  31: 'Floor 31',
  32: 'Floor 32',
};

const UNUSED_COLOR = '#B3B0B3'; // light gray

function getTeamFromBooking(booking) {
  return booking.team;
}

// FIXED: Now expects `bookings` as [{ floor, team, ...rest }]
function getFloorUsageDataFromBookings(bookings, totalDesksPerFloor) {
  const floorTeamCounts = {};
  const floorTotals = { 14: 0, 30: 0, 31: 0, 32: 0 };

  bookings.forEach(booking => {
    const floor = booking.floor;
    const team = getTeamFromBooking(booking);
    if ([14, 30, 31, 32].includes(floor) && team) {
      floorTeamCounts[floor] = floorTeamCounts[floor] || {};
      floorTeamCounts[floor][team] = (floorTeamCounts[floor][team] || 0) + 1;
      floorTotals[floor]++;
    }
  });

  return [14, 30, 31, 32].map(floor => {
    const total = totalDesksPerFloor[floor] || 1;
    const usedByTeam = floorTeamCounts[floor] || {};
    const data = {
      floor: FLOOR_LABELS[floor],
      Unused: total - floorTotals[floor],
      totalUsed: floorTotals[floor],
    };
    Object.keys(usedByTeam).forEach(team => {
      data[team] = usedByTeam[team];
    });
    return data;
  });
}

const FloorUsageChart = ({ bookings, totalDesksPerFloor }) => {
  const [teamColors, setTeamColors] = useState({});

  useEffect(() => {
    const fetchTeamColors = async () => {
      try {
        const response = await axios.get('/api/teams');
        const colorMap = {};
        response.data.forEach(team => {
          colorMap[team.teamName] = team.color || '#888';
        });
        setTeamColors(colorMap);
      } catch (error) {
        console.error('Failed to fetch team colors:', error);
      }
    };
    fetchTeamColors();
  }, []);

  const chartData = getFloorUsageDataFromBookings(bookings, totalDesksPerFloor);

  const allTeams = Array.from(
    new Set(bookings.map(b => b.team).filter(Boolean))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 h-[340px] flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        How often are desks being used on average?
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          barCategoryGap="20%"
        >
          <XAxis
            type="number"
            domain={[0, Math.max(...Object.values(totalDesksPerFloor))]}
            tickFormatter={v => v}
          />
          <YAxis
            dataKey="floor"
            type="category"
            tick={{ fontWeight: 700, fontSize: 13 }}
          />
          <Tooltip formatter={v => `${v} desks`} />
          {allTeams.map(team => (
            <Bar key={team} dataKey={team} stackId="a" fill={teamColors[team] || '#888'}>
              {team === allTeams[allTeams.length - 1] && (
                <LabelList
                  dataKey="totalUsed"
                  position="right"
                  formatter={v => `${v} desks`}
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
