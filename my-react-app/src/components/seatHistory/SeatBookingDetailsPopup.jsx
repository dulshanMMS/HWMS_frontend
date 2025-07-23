import React from 'react';

// Helper function to check if booking date is in the past
const isBookingDateInPast = (bookingDate) => {
  try {
    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return booking < today; // Return true if booking date is before today
  } catch (error) {
    return false; // If error parsing date, allow deletion
  }
};

const SeatBookingDetailsPopup = ({ selectedBooking, bookingDetails, loading, onClose, onDeleteClick }) => {
  if (!selectedBooking) return null;

  // Check if any booking is for a past date
  const hasPastDateBookings = bookingDetails.some(booking => isBookingDateInPast(booking.date));
  const showDeleteButton = bookingDetails.length > 0 && !hasPastDateBookings;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Seat Booking Details for {selectedBooking.date}</h2>
        
        {/* Show info message for past dates */}
        {hasPastDateBookings && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
            ⚠️ Expired bookings cannot be deleted
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">Loading booking details...</div>
        ) : bookingDetails.length > 0 ? (
          bookingDetails.map((booking, index) => (
            <div key={booking.bookingId || index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Booking ID:</p>
                <p className="font-medium text-sm">{booking.bookingId}</p>
                
                <p className="text-gray-600">Seat ID:</p>
                <p className="font-medium">{booking.seatId}</p>
                
                <p className="text-gray-600">Area ID:</p>
                <p className="font-medium">{booking.areaId}</p>
                
                <p className="text-gray-600">Floor:</p>
                <p className="font-medium">{booking.floor}</p>
                
                <p className="text-gray-600">Date:</p>
                <p className="font-medium flex items-center">
                  {booking.date}
                  {isBookingDateInPast(booking.date) && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Expired</span>
                  )}
                </p>
                
                <p className="text-gray-600">Entry Time:</p>
                <p className="font-medium">{booking.entryTime}</p>
                
                <p className="text-gray-600">Exit Time:</p>
                <p className="font-medium">{booking.exitTime}</p>
                
                {booking.teamName && (
                  <>
                    <p className="text-gray-600">Team:</p>
                    <p className="font-medium flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: booking.teamColor }}
                      ></span>
                      {booking.teamName}
                    </p>
                  </>
                )}
                
                {booking.bookedAt && (
                  <>
                    <p className="text-gray-600">Booked At:</p>
                    <p className="font-medium text-sm">
                      {new Date(booking.bookedAt).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
              
              {bookingDetails.length > 1 && index < bookingDetails.length - 1 && (
                <hr className="mt-4 border-gray-200" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No seat booking details found</div>
        )}

        <div className="flex justify-end mt-4 space-x-2">
          {/* Only show delete button if there are bookings and none are for past dates */}
          {showDeleteButton && (
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

export default SeatBookingDetailsPopup;