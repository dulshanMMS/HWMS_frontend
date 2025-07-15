import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../components/AdminParkingModel';
import AdminSidebar from '../components/AdminSidebar';

const AdminParking = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (endpoint, payload) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/parking/${endpoint}`, payload);
      setModalData(res.data);
    } catch (error) {
      setModalData({ error: error.response?.data?.message || 'Request failed' });
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
            Filtering Section
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
                    onClick={() => handleSubmit('filter-by-date', { date: formData.filterDate })} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
                  </button>
                </div>
                <div className="pt-7">
                  <button 
                    onClick={() => handleSubmit('filter-by-username', { username: formData.filterUsername })} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
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
                    onClick={() => handleSubmit('delete-slot', { slotNumber: formData.deleteSlotNumber })} 
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
                    onClick={() => handleSubmit('filter-by-user-and-date', { username: formData.username, date: formData.date })} 
                    className="bg-green-900 text-white px-6 py-2 rounded"
                  >
                    View
                  </button>
                </div>
                
                <div>
                  <button 
                    onClick={() => handleSubmit('add-slot', { slotNumber: formData.slotNumber, floor: formData.floor })} 
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
                  onClick={() => handleSubmit('filter-by-date', { date: formData.filterDate })} 
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
                <button 
                  onClick={() => handleSubmit('filter-by-username', { username: formData.filterUsername })} 
                  className="w-full bg-green-900 text-white py-2 px-4 rounded font-medium"
                >
                  View Results
                </button>
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
                  onClick={() => handleSubmit('filter-by-user-and-date', { username: formData.username, date: formData.date })} 
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
                  onClick={() => handleSubmit('add-slot', { slotNumber: formData.slotNumber, floor: formData.floor })} 
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
                  onClick={() => handleSubmit('delete-slot', { slotNumber: formData.deleteSlotNumber })} 
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