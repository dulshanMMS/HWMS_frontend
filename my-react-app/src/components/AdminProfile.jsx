import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import avatar from '../assets/profile_photo.jpg';

const AdminProfile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
      <img
        src={avatar}
        alt="Admin Profile"
        className="rounded-full w-12 h-12"
      />
      <div>
        <h3 className="font-semibold text-lg">Hello, Admin!</h3>
        <button className="text-green-600 font-medium text-sm" onClick={() => navigate('/admin/profile')}>Profile →</button>
      </div>
    </div>
  );
};

export default AdminProfile; 