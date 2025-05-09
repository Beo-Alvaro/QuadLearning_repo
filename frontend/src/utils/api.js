/**
 * Utility functions for making API calls with the correct base URL
 */

// Get the API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Makes a fetch request to the API with the proper base URL
 * @param {string} endpoint - The API endpoint (should start with /)
 * @param {Object} options - Fetch options
 * @returns {Promise} - The fetch promise
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Set default headers if not provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json'
    };
  }
  
  // Get the token from localStorage if available
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token && !options.headers.Authorization) {
      options.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const response = await fetch(url, options);
  
  // Check for 401 Unauthorized - could refresh token here if needed
  if (response.status === 401) {
    // Handle unauthorized - perhaps redirect to login page
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};

/**
 * Shorthand for GET requests
 */
export const apiGet = (endpoint) => {
  return apiCall(endpoint, { method: 'GET' });
};

/**
 * Shorthand for POST requests with JSON body
 */
export const apiPost = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * Shorthand for PUT requests with JSON body
 */
export const apiPut = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * Shorthand for DELETE requests
 */
export const apiDelete = (endpoint) => {
  return apiCall(endpoint, { method: 'DELETE' });
};

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
}; 