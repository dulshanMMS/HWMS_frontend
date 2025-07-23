import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const PaginationControls = ({ currentPage, setCurrentPage, totalPages, isLoading }) => {
  // Ensure currentPage and totalPages are numbers
  const safeCurrentPage = Number.isInteger(currentPage) ? currentPage : 1;
  const safeTotalPages = Number.isInteger(totalPages) ? totalPages : 1;

  // Log for debugging
  console.log('PaginationControls render:', { currentPage, totalPages, safeCurrentPage, safeTotalPages });

  return (
    <div className="flex justify-center items-center mt-4 mb-4 gap-4">
      <button
        onClick={() => setCurrentPage(Math.max(safeCurrentPage - 1, 1))}
        disabled={safeCurrentPage === 1 || isLoading}
        className={`p-2 text-white rounded-full transition-colors duration-300 relative ${
          safeCurrentPage === 1 || isLoading ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Previous page"
      >
        <FaArrowLeft className="text-lg" />
        {isLoading && (
          <span className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          </span>
        )}
      </button>
      <span className="text-gray-700 font-medium">
        &lt; {safeCurrentPage} of {safeTotalPages} &gt;
      </span>
      <button
        onClick={() => setCurrentPage(Math.min(safeCurrentPage + 1, safeTotalPages))}
        disabled={safeCurrentPage === safeTotalPages || isLoading}
        className={`p-2 text-white rounded-full transition-colors duration-300 relative ${
          safeCurrentPage === safeTotalPages || isLoading ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label="Next page"
      >
        <FaArrowRight className="text-lg" />
        {isLoading && (
          <span className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          </span>
        )}
      </button>
    </div>
  );
};

export default PaginationControls;