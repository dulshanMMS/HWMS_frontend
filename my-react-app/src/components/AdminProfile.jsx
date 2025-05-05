import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const AdminProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="relative z-[1000] flex items-center">
      <div 
        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border-2 border-white">
          {adminData?.profileImage ? (
            <img 
              src={adminData.profileImage} 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-white text-lg" />
          )}
        </div>
        <span className="font-medium text-gray-700 text-sm sm:block hidden">
          {adminData?.name || 'Admin'}
        </span>
      </div>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg w-60 overflow-hidden border border-gray-200">
          <div className="p-4 bg-primary text-white">
            <strong className="block text-base mb-1">
              {adminData?.name || 'Admin'}
            </strong>
            <span className="block text-sm opacity-80">
              {adminData?.email || 'admin@example.com'}
            </span>
          </div>
          <div className="p-2">
            <button 
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 text-left hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => navigate('/admin/profile')}
            >
              <FaUser className="text-base" />
              Profile
            </button>
            <button 
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 text-left hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => navigate('/admin/settings')}
            >
              <FaCog className="text-base" />
              Settings
            </button>
            <button 
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 text-left hover:bg-red-50 rounded-md transition-colors duration-200"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="text-base" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile; 