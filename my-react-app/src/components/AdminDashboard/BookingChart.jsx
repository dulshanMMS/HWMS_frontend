import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BookingChart = ({ parkingData, seatingData }) => {
  const [activeTab, setActiveTab] = useState("parking");

  const filteredData = (activeTab === "parking" ? parkingData : seatingData)
    .filter(item => item.floor && item.floor.toString().trim() !== "");

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Top Tab Buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("parking")}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === "parking"
              ? "bg-gray-300 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Parking Bookings
        </button>
        <button
          onClick={() => setActiveTab("seating")}
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            activeTab === "seating"
              ? "bg-gray-300 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Seating Bookings
        </button>
      </div>

      {/* Chart Title */}
      <div className="px-6 pt-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          Bookings Count by Floor
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[300px] px-6 pb-6">
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
              <Label value="Booking Count" angle={-90} position="insideLeft" dy={30} />
            </YAxis>
            <Tooltip />
            <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingChart;
