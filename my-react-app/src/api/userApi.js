import axios from "axios";

const API = "http://localhost:5004/api/user";

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
