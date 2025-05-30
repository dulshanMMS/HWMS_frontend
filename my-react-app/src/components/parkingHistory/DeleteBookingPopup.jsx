import React from 'react';
import ErrorMessage from './ErrorMessage';

const DeleteBookingPopup = ({
  deleteForm,
  onInputChange,
  onConfirm,
  onCancel,
  loading,
  error
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Please confirm the booking details to delete:</p>
        
        {error && <ErrorMessage message={error} />}

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

        <div className="flex justify-end mt-6 space-x-2">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={onConfirm}
            disabled={loading}
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
