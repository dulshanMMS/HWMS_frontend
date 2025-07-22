import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import api from '../../config/api';

const BookingLookup = ({
  searchType,
  setSearchType,
  searchQuery,
  setSearchQuery,
  onSearch,
  onClear,
  error
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearched, setIsSearched] = useState(false);
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);

  // Debounce function
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
  console.log('searchQuery updated:', searchQuery);
}, [searchQuery]);


 useEffect(() => {
  const fetchSuggestions = async () => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const endpoint = searchType === 'team' ? 'team-suggestions' : 'user-suggestions';
      const response = await api.get(`/api/reports/${endpoint}`, {
        params: { query: debouncedQuery }
      });
      console.log('Suggestions API response:', response.data); // Debug log
      setSuggestions(response.data);
      setShowSuggestions(response.data.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };
  fetchSuggestions();
}, [debouncedQuery, searchType]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
    setIsSearched(false);
  };


const handleSuggestionClick = (suggestion) => {
  console.log('Selected suggestion:', suggestion);
  setSearchQuery(suggestion.value);
  setShowSuggestions(false);
  setSelectedIndex(-1);
  setIsSearched(true);
  inputRef.current.focus();
  inputRef.current.value = suggestion.value; // Force input update
  inputRef.current.classList.add('highlight');
  setTimeout(() => inputRef.current.classList.remove('highlight'), 500);
  setTimeout(() => {
    console.log('Triggering search with query:', suggestion.value);
    onSearch(suggestion.value); // Pass value directly
  }, 0);
};

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle search or clear action
  const handleAction = () => {
    if (isSearched) {
      onClear();
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearched(false);
    } else {
      onSearch();
      setIsSearched(true);
      setShowSuggestions(false);
    }
  };

  // Handle search type change
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearched(false);
    onClear();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-12 h-32">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2 flex-1 relative">
          <FaSearch className="text-2xl text-green-900" />
          <span className="font-bold text-lg text-green-900">Booking Lookup</span>
          <select
            value={searchType}
            onChange={handleSearchTypeChange}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-900 ml-2"
          >
            <option value="name">Search by Name</option>
            <option value="team">Search by Team</option>
          </select>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={searchType === 'name' ? 'name' : 'team name'}
            className="border rounded px-2 py-1 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-900 ml-2 flex-1"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                setIsSearched(false);
                onClear();
              }}
              className="ml-1 text-gray-500 hover:text-red-600 text-lg"
              title="Clear"
            >
              <FaTimes />
            </button>
          )}
{showSuggestions && suggestions.length > 0 && (
  <ul
    className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    style={{
      width: inputRef.current ? `${inputRef.current.offsetWidth}px` : 'auto',
      left: inputRef.current ? `${inputRef.current.offsetLeft}px` : '0',
      top: inputRef.current ? `${inputRef.current.offsetTop + inputRef.current.offsetHeight}px` : '100%'
    }}
  >
    {suggestions.map((suggestion, index) => (
      <li
        key={suggestion.id || `suggestion-${index}`} // Fallback key
        ref={(el) => (suggestionRefs.current[index] = el)}
        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? 'bg-gray-100' : ''}`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from triggering handleClickOutside
          console.log('Suggestion clicked:', suggestion.label); // Debug log
          handleSuggestionClick(suggestion);
        }}
      >
        {suggestion.label}
      </li>
    ))}
  </ul>
)}
{loading && (
  <div
    className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-10 p-4 text-sm text-gray-500"
    style={{
      width: inputRef.current ? `${inputRef.current.offsetWidth}px` : 'auto',
      left: inputRef.current ? `${inputRef.current.offsetLeft}px` : '0',
      top: inputRef.current ? `${inputRef.current.offsetTop + inputRef.current.offsetHeight}px` : '100%'
    }}
  >
    Loading suggestions...
  </div>
)}
        </div>
        <button
          onClick={handleAction}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ml-0 md:ml-2 mt-2 md:mt-0 ${
            isSearched
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-900 text-white hover:bg-green-800'
          }`}
        >
          {isSearched ? (
            <>
              <FaTimes /> Clear
            </>
          ) : (
            <>
              <FaSearch /> Search
            </>
          )}
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