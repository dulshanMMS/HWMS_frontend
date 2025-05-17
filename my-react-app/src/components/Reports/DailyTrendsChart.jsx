import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DailyTrendsChart = ({ data }) => {
  const transformDailyTrends = () => {
    if (!data?.dailyTrends) return [];
    
    return data.dailyTrends.map(item => {
      const date = item._id.date ? new Date(item._id.date) : new Date();
      return {
        date: date.toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        seats: item.seatsCount || 0,
        parking: item.parkingCount || 0
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Booking Trends</h2>
      <div className="h-[300px] overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: `${Math.max(600, transformDailyTrends().length * 40)}px` }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transformDailyTrends()}>
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
              <Bar dataKey="seats" fill="#00BCD4" name="Seats" />
              <Bar dataKey="parking" fill="#9C27B0" name="Parking" />
            </BarChart>
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

export default DailyTrendsChart; 