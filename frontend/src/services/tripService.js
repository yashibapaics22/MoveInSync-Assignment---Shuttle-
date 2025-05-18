import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getUserTrips = (params = {}) => {
  return axios.get(`${API_URL}/shuttles/bookings`, { params });
};

export const bookRide = (data) => {
  return axios.post(`${API_URL}/shuttles/book`, data);
};

export const createTrip = (data) => {
  return axios.post(`${API_URL}/shuttles/book`, data);
};

export const cancelTrip = (tripId) => {
  return axios.put(`${API_URL}/shuttles/bookings/${tripId}/cancel`);
};
