// src/components/BookingScheduleBlock.jsx
import React, { useEffect } from "react";
import { FaCar, FaChair, FaMapMarkerAlt, FaClock, FaSync } from "react-icons/fa";

/**
 * Enhanced BookingScheduleBlock with loading states and optional refresh
 *
 * Props:
 * - title (string): The header/title for this schedule block.
 * - bookings (array): Array of booking objects to display.
 * - loading (boolean): Whether data is currently being fetched
 * - onRefresh (function): Optional refresh function for manual refresh
 *
 * The UI remains exactly the same, just with loading states and refresh capability
 */
const BookingScheduleBlock = ({ 
  title, 
  bookings, 
  loading = false, 
  onRefresh = null 
}) => {
  // Log bookings to console whenever bookings or title change (useful for debugging)
  useEffect(() => {
    console.log(`BookingScheduleBlock - ${title} bookings:`, bookings);
  }, [bookings, title]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-[280px]">
      {/* Block Title with optional refresh button */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-gray-800">{title}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-1 rounded-md transition-all duration-200 ${
              loading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            title="Refresh data"
          >
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Show message if no bookings */}
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-300 text-3xl mb-2">📅</div>
              <p className="text-sm text-gray-500">No bookings</p>
            </div>
          ) : (
            // Map and display each booking's info
            bookings.map((booking, i) => (
              <div
                key={`${booking._id || booking.bookingId || i}`}
                className="mb-4 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Booking type header with icon */}
                <div className="flex items-center gap-2 mb-2">
                  {booking.type === "seat" ? (
                    <FaChair className="text-green-500" />
                  ) : (
                    <FaCar className="text-blue-500" />
                  )}
                  <p className="font-medium text-gray-800">
                    {booking.type === "seat" ? "Seat Booking" : "Parking Booking"}
                  </p>
                </div>

                {/* Booking details */}
                <p className="text-sm text-gray-700 mb-2">{booking.details}</p>

                {/* Location information */}
                {booking.location && (
                  <div className="flex items-center gap-1 mb-2">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-600">{booking.location}</p>
                  </div>
                )}

                {/* Fallback floor display if location not available */}
                {!booking.location && booking.floor && (
                  <div className="flex items-center gap-1 mb-2">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-600">Floor: {booking.floor}</p>
                  </div>
                )}

                {/* Time information */}
                {booking.entryTime && booking.exitTime && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-gray-400 text-xs" />
                    <p className="text-xs text-gray-500 font-medium">
                      {booking.entryTime} - {booking.exitTime}
                    </p>
                  </div>
                )}

                {/* Additional details for seating bookings */}
                {booking.type === "seat" && booking.areaId && (
                  <div className="mt-2 text-xs text-gray-500">
                    Area: {booking.areaId}
                    {booking.seatId && ` • Seat: ${booking.seatId}`}
                  </div>
                )}

                {/* Additional details for parking bookings */}
                {booking.type === "parking" && booking.slotNumber && (
                  <div className="mt-2 text-xs text-gray-500">
                    Slot: {booking.slotNumber}
                  </div>
                )}

                {/* Date information for recent bookings */}
                {title.includes("Last") && booking.date && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span>Date: {new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default BookingScheduleBlock;