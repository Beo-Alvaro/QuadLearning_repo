// Direct API utility for authentication
// This bypasses the axios utility to handle the auth endpoint directly

/**
 * Direct login function to handle authentication
 * @param {Object} credentials - username and password
 * @returns {Promise} - resolves to the user data and token
 */
export const loginUser = async (credentials) => {
  try {
    // Use direct fetch to the API route
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // If the response is not OK, throw an error
    if (!response.ok) {
      // Try to parse the error response
      const errorData = await response.json().catch(() => ({ 
        message: `Server returned ${response.status}: ${response.statusText}` 
      }));
      
      throw new Error(errorData.message || `Authentication failed with status ${response.status}`);
    }

    // Parse the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 