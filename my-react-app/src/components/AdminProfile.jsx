import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import avatar from '../assets/profile_photo.jpg';

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
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
      <img
        src={adminData?.profileImage || avatar}
        alt="Admin Profile"
        className="rounded-full w-12 h-12"
      />
      <div>
        <h3 className="font-semibold text-lg">Hello, {adminData?.name || 'Admin'}!</h3>
        <button className="text-green-600 font-medium text-sm" onClick={() => navigate('/admin/profile')}>Profile →</button>
      </div>
    </div>
  );
};

export default AdminProfile; 