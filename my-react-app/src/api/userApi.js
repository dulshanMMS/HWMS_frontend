import axios from "axios";

const API = "http://localhost:6001/api/user";

export const getProfile = async (token) => {
  const res = await axios.get(`${API}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateProfile = async (token, profileData) => {
  const res = await axios.put(`${API}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getUnreadCount = async (token) => {
  // Mock for now - will be replaced when backend is ready
  return { unreadCount: 3 };
};


