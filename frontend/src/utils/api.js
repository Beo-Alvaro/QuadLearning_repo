/**
 * API utilities with error handling
 */

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Makes an API request with better error handling
 * @param {string} endpoint - API endpoint (should start with /)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Parsed response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  // Set default headers
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json',
    };
  }

  try {
    console.log(`Fetching: ${url}`, options);
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);

    // Get response as text first
    const text = await response.text();
    
    // Check for empty response
    if (!text) {
      console.error('Empty response received');
      throw new Error('Server returned an empty response');
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text);
      throw new Error('Invalid response format from server');
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data?.message || `Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Re-throw the error
    throw error;
  }
};

/**
 * Login function that handles auth and tokens
 */
export const loginUser = async (username, password, isEncrypted = false) => {
  const data = await apiRequest('/api/users/auth', {
    method: 'POST',
    body: JSON.stringify({ username, password, isEncrypted }),
  });

  // Store auth data
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  if (data.user) {
    localStorage.setItem('userInfo', JSON.stringify(data.user));
  }

  return data;
};

export default {
  apiRequest,
  loginUser,
}; 