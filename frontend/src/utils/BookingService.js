import axios from 'axios';

// Configure axios defaults - helpful for token management
const configureAxios = () => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set auth token for all requests if it exists
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

/**
 * Fetch all bookings for the current user (or all if admin)
 */
export const fetchAllBookings = async () => {
  configureAxios();
  try {
    console.log('BookingService: Fetching all bookings');
    const response = await axios.get('/api/bookings');
    console.log('BookingService: Bookings fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('BookingService: Error fetching bookings:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch a specific booking by ID
 */
export const fetchBookingById = async (id) => {
  configureAxios();
  try {
    const response = await axios.get(`/api/bookings/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  configureAxios();
  try {
    const response = await axios.post('/api/bookings', bookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Update an existing booking
 */
export const updateBooking = async (id, bookingData) => {
  configureAxios();
  try {
    const response = await axios.put(`/api/bookings/${id}`, bookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (id) => {
  configureAxios();
  try {
    await axios.delete(`/api/bookings/${id}`);
    return id;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Helper function to handle API errors consistently
 */
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error Response:', error.response.data);
  } else if (error.request) {
    // Request made but no response received
    console.error('API Error Request:', error.request);
  } else {
    // Something else caused the error
    console.error('API Error:', error.message);
  }
};

export default {
  fetchAllBookings,
  fetchBookingById,
  createBooking,
  updateBooking,
  deleteBooking
}; 