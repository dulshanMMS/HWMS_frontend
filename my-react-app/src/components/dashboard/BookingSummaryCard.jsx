import React from "react";
import { FaCar, FaChair, FaCalendarAlt } from "react-icons/fa";

/**
 * Enhanced BookingSummaryCard displays separate counts for parking and seating bookings
 *
 * Props:
 * - bookingCounts (object): Contains parkingCount, seatCount, and totalCount
 * - totalBookings (number): Legacy prop for backward compatibility
 * - loading (boolean): Shows loading state
 */
const BookingSummaryCard = ({
  bookingCounts,
  totalBookings,
  loading = false,
}) => {
  // Handle both new and legacy props
  let counts;

  if (bookingCounts) {
    // New format with separated counts
    counts = bookingCounts;
  } else if (totalBookings !== undefined) {
    // Legacy format - show total only without breakdown
    counts = {
      parkingCount: 0,
      seatCount: 0,
      totalCount: totalBookings,
    };
  } else {
    // Default fallback
    counts = {
      parkingCount: 0,
      seatCount: 0,
      totalCount: 0,
    };
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full">
      {/* Card title */}
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-blue-500" />
        <p className="text-lg font-semibold">Your Bookings</p>
      </div>

      {/* Total bookings count */}
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-gray-800">{counts.totalCount}</p>
        <p className="text-sm text-gray-500">Total Bookings</p>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Breakdown by type - only show if we have separated counts */}
      <div className="space-y-3">
        {/* Parking bookings */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaCar className="text-white text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Parking</p>
              <p className="text-xs text-gray-500"></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {counts.parkingCount}
            </p>
          </div>
        </div>

        {/* Seat bookings */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FaChair className="text-white text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Seating</p>
              <p className="text-xs text-gray-500"></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {counts.seatCount}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats - only show if we have breakdown data */}
      {(counts.parkingCount > 0 || counts.seatCount > 0) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              Parking:{" "}
              {counts.totalCount > 0
                ? Math.round((counts.parkingCount / counts.totalCount) * 100)
                : 0}
              %
            </span>{" "}
            <span>
              Seating:{" "}
              {counts.totalCount > 0
                ? Math.round((counts.seatCount / counts.totalCount) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="mt-2 flex rounded-full overflow-hidden h-2">
            <div
              className="bg-blue-500"
              style={{
                width:
                  counts.totalCount > 0
                    ? `${(counts.parkingCount / counts.totalCount) * 100}%`
                    : "0%",
              }}
            ></div>
            <div
              className="bg-green-500"
              style={{
                width:
                  counts.totalCount > 0
                    ? `${(counts.seatCount / counts.totalCount) * 100}%`
                    : "0%",
              }}
            ></div>
            {counts.totalCount === 0 && (
              <div className="bg-gray-300 w-full"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummaryCard;
