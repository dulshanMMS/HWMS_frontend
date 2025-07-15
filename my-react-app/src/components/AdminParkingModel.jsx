import React from 'react';

const renderData = (data) => {
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span>{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-inside ml-4">
        {data.map((item, idx) => (
          <li key={idx}>{renderData(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object' && data !== null) {
    return (
      <div className="ml-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-1">
            <strong>{key}:</strong> {renderData(value)}
          </div>
        ))}
      </div>
    );
  }

  return <span>Unknown data format</span>;
};

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

        <div className="text-sm text-gray-800 whitespace-normal">
          {renderData(data)}
        </div>
      </div>
    </div>
  );
};

export default AdminParkingModel;
