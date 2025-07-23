import React from 'react';

const BookingDetailsPopup = ({ selectedBooking, bookingDetails, loading, onClose, onDeleteClick }) => {
  if (!selectedBooking) return null;

  // Function to check if a booking is deletable (future only)
  const isBookingDeletable = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    
    // If booking is on a future date, it's deletable
    if (bookingDate.toDateString() !== now.toDateString()) {
      return bookingDate > now;
    }
    
    // If booking is today, check if current time is before entry time
    const [entryHour, entryMinute] = booking.entryTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const entryTimeInMinutes = entryHour * 60 + entryMinute;
    
    // Only deletable if current time is before entry time
    return currentTimeInMinutes < entryTimeInMinutes;
  };

  // Check if any booking in the details is deletable
  const hasDeleteableBooking = bookingDetails.some(booking => isBookingDeletable(booking));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Booking Details for {selectedBooking.date}</h2>
       <div className="overflow-y-auto max-h-[50vh] space-y-4 pr-1">    {/* scrool krn dapu div ek*/}
        {loading ? (
          <div className="text-center py-4">Loading booking details...</div>
        ) : bookingDetails.length > 0 ? (
          bookingDetails.map((booking, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Slot Number:</p>
                <p className="font-medium">{booking.slotNumber}</p>
                
                <p className="text-gray-600">Floor Number:</p>
                <p className="font-medium">{booking.floor}</p>
                
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{booking.date}</p>
                
                <p className="text-gray-600">Entry Time:</p>
                <p className="font-medium">{booking.entryTime}</p>
                
                <p className="text-gray-600">Exit Time:</p>
                <p className="font-medium">{booking.exitTime}</p>
                
                {/* Show booking status */}
                <p className="text-gray-600">Status:</p>
                <p className={`font-medium ${isBookingDeletable(booking) ? 'text-green-600' : 'text-red-600'}`}>
                  {isBookingDeletable(booking) ? 'Future Booking' : 'Past'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No booking details found</div>
        )}
       </div> 
        <div className="flex justify-end mt-4 space-x-2">
          {/* Only show delete button if there are deletable bookings */}
          {bookingDetails.length > 0 && hasDeleteableBooking && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={onDeleteClick}
            >
              Delete Booking
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPopup;