import React from "react";

/**
 * BookingSummaryCard displays a simple card showing
 * the total number of bookings for the user.
 *
 * Props:
 * - totalBookings (number): total bookings count to display.
 */
const BookingSummaryCard = ({ totalBookings }) => (
  <div className="bg-white rounded-xl shadow-md p-6 w-full lg:w-[300px]">
    {/* Card title */}
    <p className="text-lg font-semibold mb-2">Your Total Bookings</p>

    {/* Large number showing total bookings */}
    <p className="text-4xl font-bold">{totalBookings}</p>
  </div>
);

export default BookingSummaryCard;
