// import { FaSearch } from 'react-icons/fa';

// const NotificationFilters = ({
//   filter,
//   setFilter,
//   currentPage,
//   setCurrentPage,
//   totalPages,
//   // searchTerm,
//   // setSearchTerm,
// }) => {
//   return (
//     <div className="p-4 border-b border-gray-200">
//       <div className="mt-4 p-4 bg-gray-50 rounded-md">
//         <div className="flex flex-col gap-4">
//           {/* <div className="relative w-full max-w-md">
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search notifications..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
//             />
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           </div> */}
//           <div className="flex flex-nowrap gap-4 overflow-x-auto">
//             <button 
//               className={`px-4 py-2 transition-colors duration-200 flex-shrink-0 ${
//                 filter === 'all' 
//                   ? 'font-bold text-black border-b-2 border-green-600' 
//                   : 'text-gray-600'
//               }`}
//               onClick={() => setFilter('all')}
//             >
//               All
//             </button>
//             <button 
//               className={`px-4 py-2 transition-colors duration-200 flex-shrink-0 ${
//                 filter === 'announcements' 
//                   ? 'font-bold text-black border-b-2 border-green-600' 
//                   : 'text-gray-600'
//               }`}
//               onClick={() => setFilter('announcements')}
//             >
//               Announcements
//             </button>
//             <button 
//               className={`px-4 py-2 transition-colors duration-200 flex-shrink-0 ${
//                 filter === 'parking' 
//                   ? 'font-bold text-black border-b-2 border-green-600' 
//                   : 'text-gray-600'
//               }`}
//               onClick={() => setFilter('parking')}
//             >
//               Parking Bookings
//             </button>
//             <button 
//               className={`px-4 py-2 transition-colors duration-200 flex-shrink-0 ${
//                 filter === 'seating' 
//                   ? 'font-bold text-black border-b-2 border-green-600' 
//                   : 'text-gray-600'
//               }`}
//               onClick={() => setFilter('seating')}
//             >
//               Seating Bookings
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationFilters;

import { FaSearch } from 'react-icons/fa';

const NotificationFilters = ({
  filter,
  setFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  isFilterLoading, // New prop to show subtle loading indicator
}) => {
  return (
    <div className="p-4 border-b border-gray-200 relative">
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-nowrap gap-4 overflow-x-auto">
            {['all', 'announcements', 'parking', 'seating'].map((filterType) => (
              <button
                key={filterType}
                className={`px-4 py-2 transition-all duration-300 ease-in-out flex-shrink-0 relative ${
                  filter === filterType
                    ? 'font-bold text-black border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => {
                  setFilter(filterType);
                  setCurrentPage(1); // Reset to page 1 on filter change
                }}
              >
                {filterType === 'all' && 'All'}
                {filterType === 'announcements' && 'Announcements'}
                {filterType === 'parking' && 'Parking Bookings'}
                {filterType === 'seating' && 'Seating Bookings'}
                {filter === filterType && isFilterLoading && (
                  <span className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;