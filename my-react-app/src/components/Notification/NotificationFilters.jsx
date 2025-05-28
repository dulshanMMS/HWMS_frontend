import { FaSearch } from 'react-icons/fa';

const NotificationFilters = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <div className="flex flex-wrap gap-4 mb-4">
           <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'all' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('all')}
          >
            Bookings
          </button>
          <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'unread' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('unread')}
          >
            Seat Bookings
          </button>
          <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'read' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('read')}
          >
            Parking Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;