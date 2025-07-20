import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Label
} from "recharts";

const ranges = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '3months', label: 'Last 3 Months' },
];

const BookingChart = () => {
  const [activeTab, setActiveTab] = useState("parking");
  const [activeRange, setActiveRange] = useState("today");
  const [chartData, setChartData] = useState([]);

  const fetchData = async (tab, range) => {
    try {
      const res = await axios.get(`/api/bookings/count-by-floor?type=${tab}&range=${range}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const fixed = res.data.data.map(item => ({
          floor: item.floor?.toString() ?? "unknown",
          count: Number(item.count) || 0,
        }));
        setChartData(fixed);
      } else {
        console.warn(`[WARN] Invalid ${tab} response`, res.data);
        setChartData([]);
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setChartData([]);
    }
  };

  useEffect(() => {
    fetchData(activeTab, activeRange);
  }, [activeTab, activeRange]);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Top Tabs */}
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

      {/* Range Filters */}
      <div className="flex gap-2 px-6 pt-4">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setActiveRange(r.key)}
            className={`text-xs px-3 py-1 rounded-full border ${
              activeRange === r.key ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart Title */}
      <div className="px-6 pt-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          {activeTab === "parking" ? "Parking Bookings" : "Seating Bookings"} by Floor
        </h2>
      </div>

      {/* Chart */}
      <div className="h-[300px] px-6 pb-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
        ) : (
          <p className="text-center text-gray-500 mt-8">No booking data available for this range.</p>
        )}
      </div>
    </div>
  );
};

export default BookingChart;
