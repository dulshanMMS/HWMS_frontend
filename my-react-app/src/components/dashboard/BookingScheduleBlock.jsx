// src/components/BookingScheduleBlock.jsx
import React, { useEffect } from "react";
import { FaCar, FaChair, FaMapMarkerAlt, FaClock } from "react-icons/fa";

/**
 * BookingScheduleBlock displays a list of bookings under a given title.
 *
 * Props:
 * - title (string): The header/title for this schedule block.
 * - bookings (array): Array of booking objects to display.
 *
 * For each booking, it shows:
 * - Type of booking (Seat or Parking)
 * - Booking details text
 * - Enhanced location information
 * - Optional entry and exit times
 *
 * If no bookings exist, it shows a "No bookings" message.
 */
const BookingScheduleBlock = ({ title, bookings }) => {
  // Log bookings to console whenever bookings or title change (useful for debugging)
  useEffect(() => {
    console.log(`BookingScheduleBlock - ${title} bookings:`, bookings);
  }, [bookings, title]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-[280px]">
      {/* Block Title */}
      <p className="font-semibold mb-4 text-gray-800">{title}</p>

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
            key={i}
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
                <p className="text-xs text-gray-600">
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
          </div>
        ))
      )}
    </div>
  );
};

export default BookingScheduleBlock;
