import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../components/AdminParkingModel';
import AdminSidebar from '../components/AdminSidebar';
import useAuthGuard from '../components/AuthGuard';

const AdminParking = () => {
  useAuthGuard("admin");  // do roll base access control
  const [formData, setFormData] = useState({
    date: '',
    username: '',
    filterUsername: '',
    filterDate: '',
    slotNumber: '',
    floor: '',
    deleteSlotNumber: ''
  });

  const [modalData, setModalData] = useState(null);
  // NEW: Pagination state for username filter
  const [usernamePagination, setUsernamePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalItems: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper function to clear specific fields
  const clearFields = (fieldNames) => {
    const clearedFields = {};
    fieldNames.forEach(field => {
      clearedFields[field] = '';
    });
    setFormData(prev => ({ ...prev, ...clearedFields }));
  };

  // Helper function to sort dates (newest first, oldest at bottom)
  const sortDatesDescending = (data) => {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return [...data].sort((a, b) => {
        // Handle different date formats
        let dateA, dateB;
        
        if (typeof a === 'string') {
          dateA = new Date(a);
        } else if (a && a.date) {
          dateA = new Date(a.date);
        } else if (a && a.booking_date) {
          dateA = new Date(a.booking_date);
        } else {
          return 0;
        }
        
        if (typeof b === 'string') {
          dateB = new Date(b);
        } else if (b && b.date) {
          dateB = new Date(b.date);
        } else if (b && b.booking_date) {
          dateB = new Date(b.booking_date);
        } else {
          return 0;
        }
        
        return dateB - dateA; // Newest first (descending order)
      });
    }
    return data;
  };

  // NEW: Handle pagination for username filter
  const handleUsernamePagination = async (username, page = 1) => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/parking/filter-by-username', {
        username,
        page,
        limit: 50
      });
      
      const responseData = res.data;
      
      // Update pagination state
      if (responseData.pagination) {
        setUsernamePagination(responseData.pagination);
      }
      
      // Sort dates if needed (backend already sorts but keeping this for consistency)
      let sortedData = responseData;
      if (responseData.bookingDates && Array.isArray(responseData.bookingDates)) {
        sortedData = {
          ...responseData,
          bookingDates: sortDatesDescending(responseData.bookingDates)
        };
      }
      
      // Add pagination controls to modal data
      const modalDataWithPagination = {
        ...sortedData,
        // NEW: Add pagination controls for the modal
        showPagination: responseData.pagination && responseData.pagination.totalPages > 1,
        paginationControls: {
          currentPage: responseData.pagination?.currentPage || 1,
          totalPages: responseData.pagination?.totalPages || 1,
          hasNextPage: responseData.pagination?.hasNextPage || false,
          hasPrevPage: responseData.pagination?.hasPrevPage || false,
          totalItems: responseData.pagination?.totalItems || 0,
          onNextPage: () => handleUsernamePagination(username, (responseData.pagination?.currentPage || 1) + 1),
          onPrevPage: () => handleUsernamePagination(username, (responseData.pagination?.currentPage || 1) - 1),
          onPageChange: (newPage) => handleUsernamePagination(username, newPage)
        }
      };
      
      setModalData(modalDataWithPagination);
      
    } catch (error) {
      setModalData({ 
        error: error.response?.data?.message || 'Request failed',
        showPagination: false
      });
      // Reset pagination state on error
      setUsernamePagination({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalItems: 0
      });
    }
  };

  const handleSubmit = async (endpoint, payload, fieldsToClear = []) => {
    // NEW: Special handling for username filter with pagination
    if (endpoint === 'filter-by-username') {
      await handleUsernamePagination(payload.username, 1); // Start from page 1
      // Clear specified fields after successful submission
      if (fieldsToClear.length > 0) {
        clearFields(fieldsToClear);
      }
      return;
    }

    // Original logic for other endpoints
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/parking/${endpoint}`, payload);
      
      // Sort dates if this is a filter-by-username request (legacy handling, shouldn't reach here now)
      let responseData = res.data;
      
      if (endpoint === 'filter-by-username' && responseData) {
        console.log('Original response data:', responseData); // Debug log
        
        // Handle different response structures
        if (responseData.dates && Array.isArray(responseData.dates)) {
          responseData = {
            ...responseData,
            dates: sortDatesDescending(responseData.dates)
          };
        } else if (responseData.bookings && Array.isArray(responseData.bookings)) {
          responseData = {
            ...responseData,
            bookings: sortDatesDescending(responseData.bookings)
          };
        } else if (responseData.data && Array.isArray(responseData.data)) {
          responseData = {
            ...responseData,
            data: sortDatesDescending(responseData.data)
          };
        } else if (Array.isArray(responseData)) {
          responseData = sortDatesDescending(responseData);
        } else {
          // If it's an object with unknown structure, try to find arrays containing dates
          Object.keys(responseData).forEach(key => {
            if (Array.isArray(responseData[key]) && responseData[key].length > 0) {
              const firstItem = responseData[key][0];
              // Check if this array contains date-like objects or strings
              if (typeof firstItem === 'string' && !isNaN(Date.parse(firstItem))) {
                responseData[key] = sortDatesDescending(responseData[key]);
              } else if (firstItem && (firstItem.date || firstItem.booking_date)) {
                responseData[key] = sortDatesDescending(responseData[key]);
              }
            }
          });
        }
        
        console.log('Sorted response data:', responseData); // Debug log
      }
      
      setModalData(responseData);
      // Clear specified fields after successful submission
      if (fieldsToClear.length > 0) {
        clearFields(fieldsToClear);
      }
    } catch (error) {
      setModalData({ error: error.response?.data?.message || 'Request failed' });
      // Clear fields even on error (optional - you can remove this if you want to keep data on error)
      if (fieldsToClear.length > 0) {
        clearFields(fieldsToClear);
      }
    }
  };

  const handleGetUsernames = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/parking/get-usernames');
      setModalData(res.data);
    } catch (error) {
      setModalData({ error: error.response?.data?.message || 'Failed to fetch usernames' });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side Navigation - AdminSidebar */}
        <AdminSidebar /> 

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="p-4 md:p-6 lg:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Hello Admin</h1>
          <h2 className="text-xl md:text-2xl font-serif italic text-green-800 text-center mb-6 border-b-2 border-green-700 pb-2 max-w-md mx-auto">
            Parking Section
          </h2>
          
          {/* Desktop and Tablet Layout (3 columns) */}
          <div className="hidden md:block">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-10">
                <div>
                  <label className="block mb-1">Filter by date</label>
                  <input 
                    type="date" 
                    name="filterDate" 
                    value={formData.filterDate} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-1">Filter by username</label>
                  <input 
                    type="text" 
                    name="filterUsername" 
                    placeholder="Username" 
                    value={formData.filterUsername} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-2">Get booking details</label>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Enter username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                
                <div>
                  <label className="block mb-2">Enter new slot number</label>
                  <input 
                    type="number" 
                    name="slotNumber" 
                    placeholder="Slot number" 
                    value={formData.slotNumber} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-2">Delete slot number</label>
                  <input 
                    type="number" 
                    name="deleteSlotNumber" 
                    placeholder="Slot number" 
                    value={formData.deleteSlotNumber} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
              </div>
              
              {/* Middle Column */}
              <div className="space-y-11">
                <div className="pt-7">
                  <button 
                    onClick={() => handleSubmit('filter-by-date', { date: formData.filterDate }, ['filterDate'])} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
                  </button>
                </div>
                <div className="pt-7 flex gap-2">
                  <button 
                    onClick={() => handleSubmit('filter-by-username', { username: formData.filterUsername }, ['filterUsername'])} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
                  </button>
                  <button 
                    onClick={handleGetUsernames} 
                    className="bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Get Usernames
                  </button>
                </div>
                <div>
                  <label className="block mb-1">Enter date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-1">Enter floor number</label>
                  <input 
                    type="number" 
                    name="floor" 
                    placeholder="Floor" 
                    value={formData.floor} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>

                <div className="pt-7">
                  <button 
                    onClick={() => handleSubmit('delete-slot', { slotNumber: formData.deleteSlotNumber }, ['deleteSlotNumber'])} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-12">
                <div className="invisible h-20"></div>
                <div className="invisible h-20"></div>
                
                <div>
                  <button 
                    onClick={() => handleSubmit('filter-by-user-and-date', { username: formData.username, date: formData.date }, ['username', 'date'])} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
                  </button>
                </div>
                
                <div>
                  <button 
                    onClick={() => handleSubmit('add-slot', { slotNumber: formData.slotNumber, floor: formData.floor }, ['slotNumber', 'floor'])} 
                    className="bg-green-900 text-white px-6 py-2 my-6 rounded"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout (grouped sections) */}
          <div className="md:hidden space-y-6">
            {/* Filter by Date Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Filter by Date</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Select Date</label>
                  <input 
                    type="date" 
                    name="filterDate" 
                    value={formData.filterDate} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('filter-by-date', { date: formData.filterDate }, ['filterDate'])} 
                  className="w-full bg-green-900 text-white py-2 px-4 rounded font-medium"
                >
                  View Results
                </button>
              </div>
            </div>

            {/* Filter by Username Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Filter by Username</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Enter Username</label>
                  <input 
                    type="text" 
                    name="filterUsername" 
                    placeholder="Username" 
                    value={formData.filterUsername} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSubmit('filter-by-username', { username: formData.filterUsername }, ['filterUsername'])} 
                    className="flex-1 bg-green-900 text-white py-2 px-4 rounded font-medium"
                  >
                    View Results
                  </button>
                  <button 
                    onClick={handleGetUsernames} 
                    className="bg-green-700 text-white py-2 px-3 rounded font-medium text-sm"
                  >
                    Get Usernames
                  </button>
                </div>
              </div>
            </div>

            {/* Get Booking Details Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Get Booking Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Enter username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('filter-by-user-and-date', { username: formData.username, date: formData.date }, ['username', 'date'])} 
                  className="w-full bg-green-900 text-white py-2 px-4 rounded font-medium"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Add New Slot Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Add New Slot</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Slot Number</label>
                  <input 
                    type="number" 
                    name="slotNumber" 
                    placeholder="Enter slot number" 
                    value={formData.slotNumber} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Floor Number</label>
                  <input 
                    type="number" 
                    name="floor" 
                    placeholder="Enter floor number" 
                    value={formData.floor} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('add-slot', { slotNumber: formData.slotNumber, floor: formData.floor }, ['slotNumber', 'floor'])} 
                  className="w-full bg-green-900 text-white py-2 px-4 rounded font-medium"
                >
                  Add Slot
                </button>
              </div>
            </div>

            {/* Delete Slot Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Delete Slot</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">Slot Number to Delete</label>
                  <input 
                    type="number" 
                    name="deleteSlotNumber" 
                    placeholder="Enter slot number" 
                    value={formData.deleteSlotNumber} 
                    onChange={handleChange} 
                    className="w-full p-2 border rounded" 
                  />
                </div>
                <button 
                  onClick={() => handleSubmit('delete-slot', { slotNumber: formData.deleteSlotNumber }, ['deleteSlotNumber'])} 
                  className="w-full bg-green-900 text-white py-2 px-4 rounded font-medium"
                >
                  Delete Slot
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {modalData && <Modal data={modalData} onClose={() => setModalData(null)} />}
      </div>
    </div>
  );
};

export default AdminParking;