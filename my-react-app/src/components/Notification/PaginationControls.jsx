import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PaginationControls = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="flex justify-center items-center mt-4 mb-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`p-3 text-white rounded-full transition-colors duration-300 ${
          currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Previous page"
      >
        <FaArrowLeft className="text-lg" />
      </button>
      <span className="px-4 py-2 text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`p-3 text-white rounded-full transition-colors duration-300 ${
          currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Next page"
      >
        <FaArrowRight className="text-lg" />
      </button>
    </div>
  );
};

export default PaginationControls;