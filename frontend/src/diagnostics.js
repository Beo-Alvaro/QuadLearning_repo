// Diagnostic file to debug API URL issues

// Log all environment variables
console.log('Environment variables:', import.meta.env);

// Test API URL construction
const API_URL = import.meta.env.VITE_API_URL || '/api';
console.log('Constructed API URL:', API_URL);

// Test full auth URL
console.log('Auth endpoint URL:', `${API_URL}/users/auth`);

// Export a function to test the API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing connection to:', `${API_URL}/users/auth`);
    const response = await fetch(`${API_URL}/users/auth`, {
      method: 'OPTIONS', // Use OPTIONS to avoid authentication requirements
    });
    console.log('API response status:', response.status);
    console.log('API response headers:', Object.fromEntries([...response.headers]));
    return {
      status: response.status,
      headers: Object.fromEntries([...response.headers])
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { error: error.message };
  }
}; 