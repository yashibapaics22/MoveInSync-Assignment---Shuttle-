import axios from 'axios';

// Configure axios defaults for token management
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
 * Fetch all locations
 */
export const fetchAllLocations = async () => {
  configureAxios();
  try {
    console.log('LocationService: Fetching all locations');
    const response = await axios.get('/api/locations');
    console.log('LocationService: Locations fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('LocationService: Error fetching locations:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Create a new location
 */
export const createLocation = async (locationData) => {
  configureAxios();
  try {
    console.log('LocationService: Creating new location:', locationData);
    const response = await axios.post('/api/locations', locationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('LocationService: Location created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('LocationService: Error creating location:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Update a location
 */
export const updateLocation = async (id, locationData) => {
  configureAxios();
  try {
    const response = await axios.put(`/api/locations/${id}`, locationData, {
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
 * Delete a location
 */
export const deleteLocation = async (id) => {
  configureAxios();
  try {
    await axios.delete(`/api/locations/${id}`);
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
    return {
      message: error.response.data.msg || 'Server returned an error',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response received
    console.error('API Error Request:', error.request);
    return {
      message: 'No response received from server',
      request: error.request
    };
  } else {
    // Something else caused the error
    console.error('API Error:', error.message);
    return {
      message: error.message
    };
  }
};

export default {
  fetchAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
}; 