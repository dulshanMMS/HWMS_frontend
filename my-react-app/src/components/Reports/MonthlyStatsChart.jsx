import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const MonthlyStatsChart = ({ data, dateRange }) => {
  const transformMonthlyStats = () => {
    if (!data?.dailyTrends) return [];
    const [appliedStart, appliedEnd] = dateRange;
    
    let startDate, endDate;
    if (!appliedStart || !appliedEnd) {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate = new Date(appliedStart);
      endDate = new Date(appliedEnd);
    }

    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates.map(date => {
      const matchingData = data.dailyTrends.find(item => 
        new Date(item._id.date).toDateString() === date.toDateString()
      ) || { seatsCount: 0, parkingCount: 0 };

      return {
        date: date.toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        seats: matchingData.seatsCount || 0,
        parking: matchingData.parkingCount || 0
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Monthly Booking Stats</h2>
      <div className="h-[300px] overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: `${Math.max(600, transformMonthlyStats().length * 40)}px` }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transformMonthlyStats()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6B7280', fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tickMargin={15}
              />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
              <Line type="monotone" dataKey="seats" stroke="#00BCD4" name="Seats" />
              <Line type="monotone" dataKey="parking" stroke="#9C27B0" name="Parking" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex gap-8 justify-center mt-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-2 rounded-full" style={{ background: '#00BCD4' }}></span>
          <span className="text-[#00BCD4] font-semibold">Seats</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-2 rounded-full" style={{ background: '#9C27B0' }}></span>
          <span className="text-[#9C27B0] font-semibold">Parking</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatsChart; 