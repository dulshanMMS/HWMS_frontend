import React from 'react';

const SeatBookingDatesList = ({ bookingDates, loading, onDateClick }) => {
  if (loading) {
    return <div className="col-span-2 text-center py-4">Loading booking dates...</div>;
  }

  if (bookingDates.length === 0) {
    return <div className="col-span-2 text-center py-4 text-gray-500">No seat booking dates found</div>;
  }

  return (
    <>
      {bookingDates.map((date) => (
        <button
          key={date.id}
          className="bg-white p-4 border rounded-lg shadow-sm text-left hover:bg-gray-50 transition flex items-center"
          onClick={() => onDateClick(date)}
        >
          <span className="text-blue-600">🪑</span>
          <span className="ml-2">{date.date}</span>
        </button>
      ))}
    </>
  );
};

export default SeatBookingDatesList;
