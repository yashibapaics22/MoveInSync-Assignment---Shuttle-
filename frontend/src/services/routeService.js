import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getRoutes = () => {
  return axios.get(`${API_URL}/shuttles/routes`);
};

export const getLocations = () => {
  return axios.get(`${API_URL}/shuttles/locations`);
};

export const getRouteOptions = (sourceId, destinationId) => {
  return axios.get(`${API_URL}/shuttles/route-options`, {
    params: { sourceId, destinationId }
  });
};

export const addRoute = (data) => {
  return axios.post(`${API_URL}/admin/routes`, data);
};

export const updateRoute = (id, data) => {
  return axios.put(`${API_URL}/admin/routes/${id}`, data);
};

export const deleteRoute = (id) => {
  return axios.delete(`${API_URL}/admin/routes/${id}`);
};

export const addLocation = (data) => {
  return axios.post(`${API_URL}/admin/locations`, data);
};

export const updateLocation = (id, data) => {
  return axios.put(`${API_URL}/admin/locations/${id}`, data);
};

export const toggleLocationStatus = (id, active) => {
  return axios.put(`${API_URL}/admin/locations/${id}/status`, { active });
};