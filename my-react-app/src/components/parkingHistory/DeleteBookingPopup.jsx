import React, { useState, useEffect } from 'react';
import ErrorMessage from './ErrorMessage';

const DeleteBookingPopup = ({
  deleteForm,
  onInputChange,
  onConfirm,
  onCancel,
  loading,
  error
}) => {
  const [validationError, setValidationError] = useState('');

  // Function to check if the booking being deleted is in the past
  const isBookingInPast = () => {
    if (!deleteForm.date || !deleteForm.entryTime) return false;
    
    const now = new Date();
    const bookingDate = new Date(deleteForm.date);
    
    // If booking is on a future date, it's deletable
    if (bookingDate.toDateString() !== now.toDateString()) {
      return bookingDate < now;
    }
    
    // If booking is today, check if current time is past entry time
    const [entryHour, entryMinute] = deleteForm.entryTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const entryTimeInMinutes = entryHour * 60 + entryMinute;
    
    // Booking is in past if current time >= entry time
    return currentTimeInMinutes >= entryTimeInMinutes;
  };

  // Validate booking whenever form changes
  useEffect(() => {
    if (isBookingInPast()) {
      setValidationError('You cannot delete past or ongoing bookings. Only future bookings can be deleted.');
    } else {
      setValidationError('');
    }
  }, [deleteForm.date, deleteForm.entryTime]);

  const handleConfirm = () => {
    if (isBookingInPast()) {
      setValidationError('You cannot delete past or ongoing bookings. Only future bookings can be deleted.');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Please confirm the booking details to delete:</p>
        
        {error && <ErrorMessage message={error} />}
        {validationError && <ErrorMessage message={validationError} />}

        <div className="space-y-4">
          {['slotNumber', 'date', 'entryTime', 'exitTime'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'slotNumber' ? 'Slot Number' :
                 field === 'date' ? 'Date (YYYY/MM/DD)' :
                 field === 'entryTime' ? 'Entry Time' : 'Exit Time'}
              </label>
              <input
                type="text"
                name={field}
                value={deleteForm[field]}
                onChange={onInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          ))}
        </div>

        {/* Show booking status */}
        {deleteForm.date && deleteForm.entryTime && (
          <div className="mt-4 p-3 rounded-md bg-gray-100">
            <p className="text-sm text-gray-600">
              Status: <span className={`font-medium ${isBookingInPast() ? 'text-red-600' : 'text-green-600'}`}>
                {isBookingInPast() ? 'Past/Ongoing Booking (Cannot Delete)' : 'Future Booking (Can Delete)'}
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-2">
          <button
            className={`px-4 py-2 text-white rounded-lg ${
              isBookingInPast() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={handleConfirm}
            disabled={loading || isBookingInPast()}
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

export default DeleteBookingPopup;