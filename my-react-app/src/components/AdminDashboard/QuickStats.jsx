import { useEffect, useState } from "react";

const QuickStats = ({ todayBookingCount }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (todayBookingCount !== null) {
      const start = count;
      const end = todayBookingCount;
      const duration = 500;

      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const value = Math.min(
          start + (end - start) * (progress / duration),
          end
        );
        setCount(Math.floor(value));
        if (progress < duration) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, [todayBookingCount]);

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">📈 Today’s Total Bookings</h2>
      <p className="text-4xl font-extrabold text-green-600 tracking-wide">
        {todayBookingCount !== null ? count : "Loading..."}
      </p>
      <button className="mt-3 inline-block text-sm text-green-700 font-semibold hover:text-green-900 transition-all hover:underline">
        View Reports →
      </button>
    </div>
  );
};

export default QuickStats;
