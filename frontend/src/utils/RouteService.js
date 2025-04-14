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
 * Fetch all routes
 */
export const fetchAllRoutes = async () => {
  configureAxios();
  try {
    console.log('RouteService: Fetching all routes');
    const response = await axios.get('/api/routes');
    console.log('RouteService: Routes fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('RouteService: Error fetching routes:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch a specific route by ID
 */
export const fetchRouteById = async (id) => {
  configureAxios();
  try {
    const response = await axios.get(`/api/routes/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Create a new route
 */
export const createRoute = async (routeData) => {
  configureAxios();
  try {
    console.log('RouteService: Creating new route:', routeData);
    const response = await axios.post('/api/routes', routeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('RouteService: Route created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('RouteService: Error creating route:', error);
    handleApiError(error);
    throw error;
  }
};

/**
 * Update a route
 */
export const updateRoute = async (id, routeData) => {
  configureAxios();
  try {
    const response = await axios.put(`/api/routes/${id}`, routeData, {
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
 * Delete a route
 */
export const deleteRoute = async (id) => {
  configureAxios();
  try {
    await axios.delete(`/api/routes/${id}`);
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
  fetchAllRoutes,
  fetchRouteById,
  createRoute,
  updateRoute,
  deleteRoute
}; 