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

export const getDashboardStats = () => {
  return axios.get(`${API_URL}/admin/dashboard`);
};

export const getStudents = (params = {}) => {
  return axios.get(`${API_URL}/admin/users`, { params: { ...params, role: 'student' } });
};

export const updateStudentStatus = (userId, data) => {
  return axios.put(`${API_URL}/admin/users/${userId}`, data);
};

export const getAllBookings = (params = {}) => {
  return axios.get(`${API_URL}/admin/bookings`, { params });
};

export const updateBookingStatus = (bookingId, status) => {
  console.log(`Updating booking ${bookingId} to status: ${status}`);
  return axios.put(`${API_URL}/admin/bookings/${bookingId}/status`, { status });
};

export const addWalletPoints = async (userId, points) => {
  console.log(`Adding ${points} points to user ${userId}`);
  
  // Use the correct endpoint from admin.routes.js
  try {
    console.log(`Using correct admin endpoint: /admin/users/${userId}/points`);
    const response = await axios.post(`${API_URL}/admin/users/${userId}/points`, {
      points: points,
      reason: 'Admin added points'
    });
    console.log('Add points response:', response);
    return response;
  } catch (error) {
    console.error('Error adding points:', error);
    // Try alternative formats if the correct one fails
    const alternatives = [
      { url: `${API_URL}/admin/wallet/add-points`, payload: { userId, points: points } },
      { url: `${API_URL}/admin/users/${userId}/wallet`, payload: { points: points } }
    ];
    
    for (const alt of alternatives) {
      try {
        console.log(`Trying alternative: ${alt.url}`, alt.payload);
        const response = await axios.post(alt.url, alt.payload);
        console.log('Success with alternative:', response);
        return response;
      } catch (err) {
        console.log(`Alternative ${alt.url} failed:`, err.message);
      }
    }
    
    // Re-throw the original error if all alternatives fail
    throw error;
  }
};

export const createStudent = async (studentData) => {
  console.log('Creating student with data:', studentData);
  console.log('API URL:', `${API_URL}/admin/users`);
  
  // Ensure we have the auth token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No auth token found!');
    throw new Error('Authentication required. Please log in again.');
  }
  
  try {
    const response = await axios.post(`${API_URL}/admin/users`, studentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Create student success:', response.data);
    return response;
  } catch (error) {
    console.error('Error in createStudent API call:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.error('API route not found. Checking alternative route...');
      // Try alternative route as fallback
      try {
        const altResponse = await axios.post(`${API_URL}/auth/register`, {
          ...studentData,
          role: 'student'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Create student via register success:', altResponse.data);
        return altResponse;
      } catch (altError) {
        console.error('Alternative route also failed:', altError.response?.data || altError.message);
        throw altError;
      }
    }
    throw error;
  }
};

export const updateStudent = async (userId, userData) => {
  console.log('Updating student with ID:', userId, 'Data:', userData);
  
  // Ensure we have the auth token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No auth token found!');
    throw new Error('Authentication required. Please log in again.');
  }
  
  try {
    // Use the simple update endpoint - direct POST route
    console.log('Using simple update endpoint');
    const response = await axios.post(`${API_URL}/simple-update-student/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Update student success:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating student:', error.message);
    console.error('Error details:', error.response?.data || '(No response data)');
    throw error;
  }
};