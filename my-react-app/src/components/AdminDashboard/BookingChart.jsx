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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const isToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return selectedDate === today;
  };

  const fetchData = async (tab, range, date) => {
    try {
      const params = new URLSearchParams();
      params.append("type", tab);

      if (!isToday()) {
        // Use custom date, force range=custom
        params.append("range", "custom");
        params.append("date", selectedDate);
      } else {
        // Default case (today), use range
        params.append("range", range);
      }

      const res = await axios.get(`/api/bookings/count-by-floor?${params.toString()}`);
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
    fetchData(activeTab, activeRange, selectedDate);
  }, [activeTab, activeRange, selectedDate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border px-3 py-2 shadow-md rounded-md text-sm">
          <p className="font-semibold text-gray-800">Floor: {label}</p>
          <p className="text-green-700">Bookings: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-hidden animate-fade-in">
      {/* Top Tabs */}
      <div className="flex border-b border-gray-100">
        {["parking", "seating"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-gray-400 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab === "parking" ? "Parking Bookings" : "Seating Bookings"}
          </button>
        ))}
      </div>

      {/* Range Filters */}
      <div className="flex gap-2 px-6 pt-4 flex-wrap">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveRange(r.key)}
            disabled={!isToday()} // ✅ disable if custom date
            className={`text-xs px-3 py-1 rounded-full border font-medium ${
              activeRange === r.key
                ? "bg-green-700 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } ${!isToday() ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
        <label className="text-sm font-medium text-gray-600 block mb-1">
          Choose a specific date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-1 text-sm text-gray-700 w-full"
        />
      </div>

      {/* Chart Title */}
      <div className="px-6 pt-4">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">
          📊 {activeTab === "parking" ? "Parking" : "Seating"} Bookings by Floor
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
                <Label
                  value="Booking Count"
                  angle={-90}
                  position="insideLeft"
                  dy={30}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill={activeTab === "parking" ? "#16a34a" : "#16a34a"}
                radius={[6, 6, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No booking data available for this range.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingChart;
