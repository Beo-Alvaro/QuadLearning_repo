import axios from 'axios';

// Get the API URL from environment variables, with fallback
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add this option to accept self-signed certificates when in production
  ...(import.meta.env.MODE === 'production' ? { 
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) 
  } : {})
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log requests in development
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null
      });
    }
    
    // Check if it's a network error or server not responding
    if (error.message === 'Network Error' || !error.response) {
      console.error('Network error or server not responding:', error);
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection or try again later.'
      });
    }

    // Handle specific HTTP error codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - token might be expired
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject({
          message: 'Your session has expired. Please login again.'
        });
      case 403:
        return Promise.reject({
          message: 'You do not have permission to access this resource.'
        });
      case 404:
        return Promise.reject({
          message: 'The requested resource was not found.'
        });
      case 405:
        return Promise.reject({
          message: 'Method not allowed. The server does not support this request method.'
        });
      case 500:
        return Promise.reject({
          message: 'An internal server error occurred. Please try again later.'
        });
      default:
        // Try to extract error message from response
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'An unexpected error occurred';
        return Promise.reject({
          message: errorMessage,
          status: error.response.status
        });
    }
  }
);

export default api; 