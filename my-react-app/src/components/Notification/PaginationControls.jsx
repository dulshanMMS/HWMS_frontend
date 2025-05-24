import React from 'react';

const PaginationControls = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`px-6 py-3 text-white font-bold rounded-lg mr-2 transition-colors duration-300 ${
          currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        Previous
      </button>
      <button
        onClick={() => setCurrentPage(prev => prev + 1)}
        className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg transition-colors duration-300 hover:bg-blue-600"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls; 