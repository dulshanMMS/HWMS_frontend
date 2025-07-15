import { FaSearch } from 'react-icons/fa';

const NotificationFilters = ({
  filter,
  setFilter
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
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
            All
          </button>
          <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'announcements' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('announcements')}
          >
            Announcements
          </button>
          <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'parking' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('parking')}
          >
            Parking Bookings
          </button>
          <button 
            className={`px-4 py-2 transition-colors duration-200 ${
              filter === 'seating' 
                ? 'font-bold text-black border-b-2 border-green-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setFilter('seating')}
          >
            Seating Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;