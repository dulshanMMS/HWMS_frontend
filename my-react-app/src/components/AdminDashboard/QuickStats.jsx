import React from "react";

/**
 * Shows today booking count and link to reports.
 * @param {number|null} todayBookingCount - Today's booking count.
 */

const QuickStats = ({ todayBookingCount }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="font-semibold mb-2">Today Quick Stats</h2>
    <p className="text-3xl font-bold text-black-600">
      {todayBookingCount !== null ? todayBookingCount : "Loading..."}
    </p>
    <button className="text-green-600 font-medium mt-2">View Reports →</button>
  </div>
);

export default QuickStats;