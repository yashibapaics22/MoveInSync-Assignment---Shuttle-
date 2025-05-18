import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Add authorization header to all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getWalletBalance = () => {
  return axios.get(`${API_URL}/wallet/balance`);
};

export const getTransactionHistory = () => {
  return axios.get(`${API_URL}/wallet/transactions`);
};

export const addFunds = (data) => {
  return axios.post(`${API_URL}/wallet/add-funds`, { 
    amount: parseFloat(data.amount) 
  });
};