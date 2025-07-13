import { FaSearch } from 'react-icons/fa';

const BookingLookup = ({
  searchType,
  setSearchType,
  searchQuery,
  setSearchQuery,
  onSearch,
  error
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <FaSearch className="text-2xl text-green-900" />
          <span className="font-bold text-lg text-green-900">Booking Lookup</span>
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-900 ml-2"
          >
            <option value="username">Search by User name</option>
            <option value="team">Search by Team</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              searchType === 'username' ? 'user name' :
              searchType === 'team' ? 'team name' : ''
            }
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-900 ml-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="ml-1 text-gray-500 hover:text-red-600 text-lg"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={onSearch}
          className="flex items-center gap-2 bg-green-900 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors ml-0 md:ml-2 mt-2 md:mt-0"
        >
          <FaSearch /> Search
        </button>
      </div>
      {error && (
        <div className="mt-3 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default BookingLookup; 

// import React, { useState, useEffect, useRef } from 'react';
// import { FaSearch, FaTimes } from 'react-icons/fa';

// const BookingLookup = ({
//   searchType,
//   setSearchType,
//   searchQuery,
//   setSearchQuery,
//   onSearch,
//   error
// }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(-1);
//   const inputRef = useRef(null);
//   const suggestionRefs = useRef([]);

//   // Debounce function
//   const useDebounce = (value, delay) => {
//     const [debouncedValue, setDebouncedValue] = useState(value);
    
//     useEffect(() => {
//       const handler = setTimeout(() => {
//         setDebouncedValue(value);
//       }, delay);
      
//       return () => {
//         clearTimeout(handler);
//       };
//     }, [value, delay]);
    
//     return debouncedValue;
//   };

//   const debouncedQuery = useDebounce(searchQuery, 300);

//   // Fetch suggestions
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (!debouncedQuery || debouncedQuery.length < 1) {
//         setSuggestions([]);
//         setShowSuggestions(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const endpoint = searchType === 'team' ? 'team-suggestions' : 'user-suggestions';
//         const response = await fetch(`/api/reports/${endpoint}?query=${encodeURIComponent(debouncedQuery)}`);
        
//         if (response.ok) {
//           const data = await response.json();
//           setSuggestions(data);
//           setShowSuggestions(data.length > 0);
//         } else {
//           setSuggestions([]);
//           setShowSuggestions(false);
//         }
//       } catch (error) {
//         console.error('Error fetching suggestions:', error);
//         setSuggestions([]);
//         setShowSuggestions(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSuggestions();
//   }, [debouncedQuery, searchType]);

//   // Handle input change
//   const handleInputChange