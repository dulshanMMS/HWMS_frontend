import React from 'react';

const AdminParkingModel = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-gray-600 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-green-900">Results</h2>

        <pre className="whitespace-pre-wrap text-sm text-gray-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AdminParkingModel;
