import React from 'react';

// Helper function to check if booking date is in the past
const isDateInPast = (dateString) => {
  try {
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingDate < today;
  } catch (error) {
    return false;
  }
};

const SeatBookingDatesList = ({ bookingDates, loading, onDateClick }) => {
  if (loading) {
    return <div className="col-span-2 text-center py-4">Loading booking dates...</div>;
  }

  if (bookingDates.length === 0) {
    return <div className="col-span-2 text-center py-4 text-gray-500">No seat booking dates found</div>;
  }

  return (
    <>
      {bookingDates.map((date) => {
        const isPastDate = isDateInPast(date.date);
        
        return (
          <button
            key={date.id}
            className={`p-4 border rounded-lg shadow-sm text-left transition flex items-center justify-between ${
              isPastDate 
                ? 'bg-gray-100 hover:bg-gray-150 text-gray-600' 
                : 'bg-white hover:bg-gray-50 text-gray-900'
            }`}
            onClick={() => onDateClick(date)}
          >
            <div className="flex items-center">
              <span className={`${isPastDate ? 'text-gray-400' : 'text-blue-600'}`}>🪑</span>
              <span className="ml-2">{date.date}</span>
            </div>
            {isPastDate && (
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">
                Expired
              </span>
            )}
          </button>
        );
      })}
    </>
  );
};

export default SeatBookingDatesList;