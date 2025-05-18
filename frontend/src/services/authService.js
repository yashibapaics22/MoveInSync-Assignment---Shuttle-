import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set the AUTH token for any request
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

export const login = (data) => {
  return axios.post(`${API_URL}/auth/login`, data);
};

export const register = (data) => {
  return axios.post(`${API_URL}/auth/register`, data);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
};