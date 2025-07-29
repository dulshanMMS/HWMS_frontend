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

// Helper function to check if booking date is today
const isDateToday = (dateString) => {
  try {
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingDate.getTime() === today.getTime();
  } catch (error) {
    return false;
  }
};

// Helper function to sort dates: today first, then future dates (ascending), then past dates (descending)
const sortBookingDates = (dates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return [...dates].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);
    
    const isAToday = dateA.getTime() === today.getTime();
    const isBToday = dateB.getTime() === today.getTime();
    const isAFuture = dateA > today;
    const isBFuture = dateB > today;
    const isAPast = dateA < today;
    const isBPast = dateB < today;
    
    // Today bookings come first
    if (isAToday && !isBToday) return -1; // A is today, B is not
    if (!isAToday && isBToday) return 1;  // B is today, A is not
    
    // Both are today (shouldn't happen but just in case)
    if (isAToday && isBToday) return 0;
    
    // Future dates come second (ascending order - nearest future first)
    if (isAFuture && isBFuture) {
      return dateA - dateB; // Earlier future dates first
    }
    
    // Past dates come last (descending order - most recent past first)
    if (isAPast && isBPast) {
      return dateB - dateA; // More recent past dates first
    }
    
    // Future vs past (future comes before past)
    if (isAFuture && isBPast) return -1; // Future before past
    if (isAPast && isBFuture) return 1;  // Future before past
    
    // Default fallback
    return dateA - dateB;
  });
};

const SeatBookingDatesList = ({ bookingDates, loading, onDateClick }) => {
  if (loading) {
    return <div className="col-span-2 text-center py-4">Loading booking dates...</div>;
  }

  if (bookingDates.length === 0) {
    return <div className="col-span-2 text-center py-4 text-gray-500">No seat booking dates found</div>;
  }

  // Sort the booking dates before rendering
  const sortedBookingDates = sortBookingDates(bookingDates);

  return (
    <>
      {sortedBookingDates.map((date) => {
        const isPastDate = isDateInPast(date.date);
        const isTodayDate = isDateToday(date.date);
        
        return (
          <button
            key={date.id}
            className={`p-4 border rounded-lg shadow-sm text-left transition flex items-center justify-between ${
              isPastDate 
                ? 'bg-gray-100 hover:bg-gray-150 text-gray-600' 
                : isTodayDate
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                : 'bg-white hover:bg-gray-50 text-gray-900'
            }`}
            onClick={() => onDateClick(date)}
          >
            <div className="flex items-center">
              <span className={`${
                isPastDate 
                  ? 'text-gray-400' 
                  : isTodayDate 
                  ? 'text-blue-600' 
                  : 'text-green-600'
              }`}>
                🪑
              </span>
              <span className="ml-2">{date.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              {isTodayDate && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  Today
                </span>
              )}
              {isPastDate && (
                <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">
                  Expired
                </span>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
};

export default SeatBookingDatesList;