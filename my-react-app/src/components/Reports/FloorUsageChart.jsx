
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const UNUSED_COLOR = '#B3B0B3'; // light gray

// Mapping of Tailwind background color classes to hex values
const tailwindToHex = {
  'bg-red-500': '#EF4444',
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#22C55E',
  'bg-yellow-500': '#F59E0B',
  'bg-purple-500': '#A855F7',
  'bg-pink-500': '#EC4899',
  'bg-indigo-500': '#6366F1',
  'bg-teal-500': '#14B8A6',
  'bg-orange-500': '#F97316',
  'bg-cyan-500': '#06B6D4',
  'bg-amber-500': '#F59E0B',
  'bg-lime-500': '#84CC16',
  'bg-stone-500': '#78716C',
  'bg-rose-500': '#F43F5E',
  'bg-violet-500': '#8B5CF6',
  'bg-emerald-500': '#10B981'
};

function getTeamFromBooking(booking) {
  return booking.team || 'No Team';
}

function getFloorUsageDataFromBookings(bookings, totalDesksPerFloor) {
  const floorTeamCounts = {};
  const floorTotals = {};

  // Filter for seating bookings only
  const seatingBookings = bookings.filter(booking => booking.type === 'seat');

  seatingBookings.forEach(booking => {
    const floor = booking.slot?.floor;
    const team = getTeamFromBooking(booking);
    if (floor && team) {
      floorTeamCounts[floor] = floorTeamCounts[floor] || {};
      floorTeamCounts[floor][team] = (floorTeamCounts[floor][team] || 0) + 1;
      floorTotals[floor] = (floorTotals[floor] || 0) + 1;
    }
  });

  // Include all floors with bookings, using raw floor numbers
  const bookedFloors = Object.keys(floorTotals).map(Number);
  return bookedFloors.map(floor => {
    const total = totalDesksPerFloor[floor] || 1; // Use 1 as fallback if floor not in totalDesksPerFloor
    const usedByTeam = floorTeamCounts[floor] || {};
    const data = {
      floor: `Floor ${floor}`, // Use raw floor number with "Floor" prefix
      Unused: total - (floorTotals[floor] || 0),
      totalUsed: floorTotals[floor] || 0,
    };
    Object.keys(usedByTeam).forEach(team => {
      data[team] = usedByTeam[team];
    });
    return data;
  });
}

const FloorUsageChart = ({ bookings, totalDesksPerFloor }) => {
  const [teamColors, setTeamColors] = useState({});
  const [isLoadingColors, setIsLoadingColors] = useState(true);

  useEffect(() => {
    const fetchTeamColors = async () => {
      try {
        const response = await axios.get('/api/teams', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const colorMap = {};
        response.data.forEach(team => {
          colorMap[team.teamName] = tailwindToHex[team.color] || '#888'; // Convert Tailwind to hex
        });
        setTeamColors(colorMap);
      } catch (error) {
        console.error('Failed to fetch team colors:', error);
      } finally {
        setIsLoadingColors(false);
      }
    };
    fetchTeamColors();
  }, []);

  const chartData = getFloorUsageDataFromBookings(bookings, totalDesksPerFloor);

  const allTeams = Array.from(
    new Set(bookings.filter(b => b.type === 'seat').map(b => b.team).filter(Boolean))
  );

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 h-[340px] flex flex-col justify-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          How often are desks being used on average?
        </h2>
        <p className="text-gray-600">No seating bookings found for the selected period.</p>
      </div>
    );
  }

  if (isLoadingColors) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 h-[340px] flex flex-col justify-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          How often are desks being used on average?
        </h2>
        <p className="text-gray-600">Loading team colors...</p>
      </div>
    );
  }

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
            domain={[0, Math.max(...Object.values(totalDesksPerFloor).filter(n => !isNaN(n)) || [1])]}
            tickFormatter={v => v}
          />
          <YAxis
            dataKey="floor"
            type="category"
            tick={{ fontWeight: 700, fontSize: 13 }}
          />
          <Tooltip formatter={v => `${v} desks`} />
          {allTeams.map((team, index) => (
            <Bar
              key={team}
              dataKey={team}
              stackId="a"
              fill={teamColors[team] || '#888'} // Use converted hex color or default gray
            />
          ))}
          <Bar dataKey="Unused" stackId="a" fill={UNUSED_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FloorUsageChart;
