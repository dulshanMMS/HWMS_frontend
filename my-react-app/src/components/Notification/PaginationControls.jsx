import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PaginationControls = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className="flex justify-center items-center mt-4 mb-4 gap-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`p-2 text-white rounded-full transition-colors duration-300 ${
          currentPage === 1 ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Previous page"
      >
        <FaArrowLeft className="text-lg" />
      </button>
      <span className="text-gray-700 font-medium">
        &lt; {currentPage} of {totalPages} &gt;
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`p-2 text-white rounded-full transition-colors duration-300 ${
          currentPage === totalPages ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Next page"
      >
        <FaArrowRight className="text-lg" />
      </button>
    </div>
  );
};

export default PaginationControls;