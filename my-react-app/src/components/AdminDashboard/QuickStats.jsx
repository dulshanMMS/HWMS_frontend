import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const QuickStats = ({ todayBookingCount }) => {
  const [counts, setCounts] = useState({ total: 0, parking: 0, seating: 0 });

  useEffect(() => {
    if (
      todayBookingCount &&
      typeof todayBookingCount.total === "number"
    ) {
      const duration = 500;

      const animateValue = (key, endValue) => {
        const startValue = counts[key];
        let startTime;

        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const value = Math.min(
            startValue + (endValue - startValue) * (progress / duration),
            endValue
          );
          setCounts((prev) => ({
            ...prev,
            [key]: Math.floor(value),
          }));
          if (progress < duration) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      };

      animateValue("total", todayBookingCount.total);
      animateValue("seating", todayBookingCount.seatingCount);
      animateValue("parking", todayBookingCount.parkingCount);
    }
  }, [todayBookingCount]);

  const isReady =
    todayBookingCount &&
    typeof todayBookingCount.total === "number" &&
    typeof todayBookingCount.seatingCount === "number" &&
    typeof todayBookingCount.parkingCount === "number";

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-xl ring-1 ring-gray-200 animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        📈 Today’s Total Bookings
      </h2>
      {isReady ? (
        <div className="flex items-center gap-8">
          <p className="text-4xl font-extrabold text-green-600 tracking-wide">
            {counts.total}
          </p>
          <div className="text-sm text-gray-600 space-x-5">
            <span className="font-medium">
              🪑 Seating: <span className="font-bold">{counts.seating}</span>
            </span>
            <span className="font-medium">
              🚗 Parking: <span className="font-bold">{counts.parking}</span>
            </span>
          </div>
        </div>
      ) : (
        <p className="text-4xl font-extrabold text-green-600 tracking-wide">Loading...</p>
      )}
      <Link to="/admin-reports">
        <button className="mt-4 inline-block text-sm text-green-700 font-semibold hover:text-green-900 transition-all hover:underline">
          View Reports →
        </button>
      </Link>
    </div>
  );
};

export default QuickStats;
