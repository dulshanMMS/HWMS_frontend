// src/components/BookingScheduleBlock.jsx
import React, { useEffect } from "react";

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
 * - Optional floor information
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
    <div className="bg-white rounded-xl shadow-md p-6 w-[260px]">
      {/* Block Title */}
      <p className="font-semibold mb-2">{title}</p>

      {/* Show message if no bookings */}
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No bookings</p>
      ) : (
        // Map and display each booking's info
        bookings.map((booking, i) => (
          <div key={i} className="mb-3 text-sm text-gray-700">
            {/* Booking type label and details */}
            <p className="font-medium text-green-700">
              {booking.type === "seat" ? "Seat" : "Parking"}: {booking.details}
            </p>

            {/* Optional floor number */}
            {booking.floor && (
              <p className="text-xs text-gray-500">Floor: {booking.floor}</p>
            )}

            {/* Optional entry and exit times */}
            {booking.entryTime && booking.exitTime && (
              <p className="text-xs text-gray-500">
                {booking.entryTime} - {booking.exitTime}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BookingScheduleBlock;
