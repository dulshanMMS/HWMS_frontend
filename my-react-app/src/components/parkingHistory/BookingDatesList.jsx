import React from 'react';

const BookingDatesList = ({ bookingDates, loading, onDateClick }) => {
  // Helper function to get simple date label
  const getDateLabel = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    
    // Set both dates to start of day for accurate comparison
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate.getTime() === today.getTime()) return 'Today';
    if (bookingDate > today) return 'Upcoming';
    return ''; // Past dates get no label
  };

  if (loading) {
    return <div className="col-span-2 text-center py-4">Loading booking dates...</div>;
  }

  if (bookingDates.length === 0) {
    return <div className="col-span-2 text-center py-4 text-gray-500">No booking dates found</div>;
  }

  return (
    <>
      {bookingDates.map((date) => {
        const dateLabel = getDateLabel(date.date);
        
        return (
          <button
            key={date.id}
            className="bg-white p-4 border rounded-lg shadow-sm text-left hover:bg-gray-50 transition flex items-center justify-between"
            onClick={() => onDateClick(date)}
          >
            <div className="flex items-center">
              <span className="text-green-800">❯</span>
              <span className="ml-2">{date.date}</span>
            </div>
            {dateLabel && (
              <span className="text-sm font-medium text-green-600">
                {dateLabel}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
};

export default BookingDatesList;