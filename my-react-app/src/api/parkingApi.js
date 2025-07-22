import axios from "axios";

const BASE_URL = "http://localhost:5000/api/parking";

const getToken = () => localStorage.getItem("token");

export const fetchAvailableSlots = async (data) => {
  const res = await axios.post(`${BASE_URL}/available-slots`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data.availableSlots;
};

export const bookParkingSlot = async (data) => {
  const res = await axios.post(`${BASE_URL}/book-slot`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};
