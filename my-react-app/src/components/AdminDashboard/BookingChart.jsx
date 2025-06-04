import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";

/**
 * Bar chart showing bookings count by floor.
 * Array of floor stats with {floor, count}.
 */

const BookingChart = ({ data }) => {
  // Remove empty floor entries for better chart display
  const filteredData = data.filter(
    (item) => item.floor && item.floor.trim() !== ""
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md h-[300px]">
      <h2 className="text-lg font-semibold mb-4">Bookings Count</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredData}
          margin={{ top: 10, right: 10, left: 10, bottom: 45 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="floor">
            <Label value="Floors" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis allowDecimals={false}>
            <Label
              value="Booking Count"
              angle={-90}
              position="insideLeft"
              dy={30}
            />
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingChart;