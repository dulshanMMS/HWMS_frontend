import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './AdminProfile.css';

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
    <div className="admin-profile">
      <div 
        className="profile-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="profile-avatar">
          {adminData?.profileImage ? (
            <img 
              src={adminData.profileImage} 
              alt="Admin Profile" 
              className="avatar-image"
            />
          ) : (
            <FaUser className="avatar-icon" />
          )}
        </div>
        <span className="admin-name">
          {adminData?.name || 'Admin'}
        </span>
      </div>

      {showDropdown && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <strong>{adminData?.name || 'Admin'}</strong>
            <span>{adminData?.email || 'admin@example.com'}</span>
          </div>
          <div className="dropdown-items">
            <button className="dropdown-item" onClick={() => navigate('/admin/profile')}>
              <FaUser className="item-icon" />
              Profile
            </button>
            <button className="dropdown-item" onClick={() => navigate('/admin/settings')}>
              <FaCog className="item-icon" />
              Settings
            </button>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="item-icon" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile; 