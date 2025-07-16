import React from 'react';
import ErrorMessage from './ErrorMessage';

const DeleteSeatBookingPopup = ({
  deleteForm,
  onInputChange,
  onConfirm,
  onCancel,
  loading,
  error,
  bookingDetails
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        
        {bookingDetails && bookingDetails.length > 1 ? (
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">Multiple bookings found for this date. Select which booking to delete:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bookingDetails.map((booking, index) => (
                <label key={booking.bookingId || index} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="selectedBooking"
                    value={booking.bookingId}
                    checked={deleteForm.bookingId === booking.bookingId}
                    onChange={(e) => onInputChange({
                      target: {
                        name: 'bookingId',
                        value: e.target.value
                      }
                    })}
                    className="text-red-600"
                  />
                  <div className="text-sm">
                    <p><strong>Seat:</strong> {booking.seatId}</p>
                    <p><strong>Time:</strong> {booking.entryTime} - {booking.exitTime}</p>
                    <p className="text-gray-500">ID: {booking.bookingId}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="mb-4">Please confirm the seat booking details to delete:</p>
            
            {error && <ErrorMessage message={error} />}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID (Preferred)
                </label>
                <input
                  type="text"
                  name="bookingId"
                  value={deleteForm.bookingId || ''}
                  onChange={onInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter booking ID for exact match"
                />
              </div>
              
              <div className="text-center text-gray-500 text-sm">OR use manual details below</div>
              
              {['seatId', 'date', 'entryTime', 'exitTime'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field === 'seatId' ? 'Seat ID' :
                     field === 'date' ? 'Date (YYYY-MM-DD)' :
                     field === 'entryTime' ? 'Entry Time' : 'Exit Time'}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={deleteForm[field] || ''}
                    onChange={onInputChange}
                    className="w-full p-2 border rounded-md"
                    disabled={!!deleteForm.bookingId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-2">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading || (!deleteForm.bookingId && (!deleteForm.seatId || !deleteForm.date))}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
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

export default DeleteSeatBookingPopup;
