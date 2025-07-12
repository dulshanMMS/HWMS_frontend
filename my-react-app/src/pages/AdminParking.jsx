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
    setFormData({ ...formData, [e.target.name]: e.target.value });  //updates the formData based on the input's name attribute.


  };

  const handleSubmit = async (endpoint, payload) => {   //endpoint as a parameter to pproach allows me to reuse a single function for multiple backend calls
    try {
      const res = await axios.post(`http://localhost:5000/api/admin/parking/${endpoint}`, payload);
      setModalData(res.data);  //response show in a model 
    } catch (error) {
      setModalData({ error: error.response?.data?.message || 'Request failed' });  //handle Api errors catches errors from axios POST calls.
    }
  };
  
  const handleclick=()=>{
    setShowalert(true);
  }
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side Navigation - AdminSidebar */}

      {/*<div className="w-64 h-full bg-green-800 text-white">
        <AdminSidebar />
      </div>*/}
      
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="p-6 md:p-10">
          <h1 className="text-3xl font-bold text-center mb-8">Hello Admin</h1>
          <h2 className="text-2xl font-serif italic text-green-800 text-center mb-6 border-b-2 border-green-700 pb-2 max-w-md mx-auto">Filtering Section</h2>
          
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">  {/*Form & Buttons(for all form) Grid Layout,for responsive*/}
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
                <div>
            
                </div>
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
              {/* Empty div for first two entries to align buttons properly */}
              <div className="invisible h-20"></div>
              <div className="invisible h-20"></div>
              
              {/* View button for booking details - aligned with "Get booking details" */}
              <div>
                <button 
                  onClick={() => handleSubmit('filter-by-user-and-date', { username: formData.username, date: formData.date })} 
                  className="bg-green-900 text-white px-6 py-2 rounded"
                >
                  View
                </button>
              </div>
              
              {/* Enter button - aligned with "Enter new slot number" */}
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
        
        {modalData && <Modal data={modalData} onClose={() => setModalData(null)} />}
      </div>
    </div>
  );
};

export default AdminParking;