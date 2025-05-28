import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/profile_photo.jpg';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
      <img
        src={userData?.profileImage || avatar}
        alt="User Profile"
        className="rounded-full w-12 h-12"
      />
      <div>
        <h3 className="font-semibold text-lg">Hello, {userData?.name || 'User'}!</h3>
        <button className="text-green-600 font-medium text-sm" onClick={() => navigate('/user/profile')}>Profile →</button>
      </div>
    </div>
  );
};

export default UserProfile; 