import React from 'react';

const BookingDetailsPopup = ({ selectedBooking, bookingDetails, loading, onClose, onDeleteClick }) => {
  if (!selectedBooking) return null;

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
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No booking details found</div>
        )}
       </div> 
        <div className="flex justify-end mt-4 space-x-2">
          {bookingDetails.length > 0 && (
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
