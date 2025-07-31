import React from 'react';

const BookingSelectionPopup = ({
  selectedBooking,
  bookingDetails,
  onSelectBooking,
  onCancel,
  loading
}) => {
  const formatTime = (time) => {
    return time || 'N/A';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Select Booking to Delete</h2>
        <p className="mb-4 text-gray-600">
          You have multiple bookings on {formatDate(selectedBooking?.date)}. 
          Please select which booking you want to delete:
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bookingDetails.map((booking, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectBooking(booking)}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Slot Number</span>
                    <p className="font-medium">#{booking.slotNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Floor</span>
                    <p className="font-medium">Floor {booking.floor}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Entry Time</span>
                    <p className="font-medium">{formatTime(booking.entryTime)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Exit Time</span>
                    <p className="font-medium">{formatTime(booking.exitTime)}</p>
                  </div>
                </div>
                
                {/* Time range display */}
                <div className="mt-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                  {formatTime(booking.entryTime)} - {formatTime(booking.exitTime)}
                </div>
                
                {/* Selection hint */}
                <div className="mt-2 text-xs text-blue-600">
                  Click to select this booking for deletion
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSelectionPopup;