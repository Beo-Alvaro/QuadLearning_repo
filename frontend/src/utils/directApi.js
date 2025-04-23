// Direct API utility for authentication
// This bypasses the axios utility to handle the auth endpoint directly

/**
 * Direct login function to handle authentication
 * @param {Object} credentials - username and password
 * @returns {Promise} - resolves to the user data and token
 */
export const loginUser = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', {
      username: credentials.username,
      // Don't log the password
      isEncrypted: credentials.isEncrypted
    });
    
    // Use direct fetch to the API route
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // Include cookies if any
    });

    console.log('Login response status:', response.status, response.statusText);
    
    // Get the raw text first to avoid JSON parsing errors
    const rawText = await response.text();
    console.log('Raw response text length:', rawText.length);
    
    // If response is empty, throw a clear error
    if (!rawText || rawText.trim() === '') {
      console.error('Empty response received from server');
      throw new Error('Server returned an empty response. Please try again or contact support.');
    }
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(rawText);
      console.log('Successfully parsed response as JSON');
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Raw response preview:', rawText.substring(0, 500));
      throw new Error('Server returned an invalid response format. Please try again or contact support.');
    }
    
    // Check if the response indicates an error
    if (!response.ok) {
      const errorMessage = data.message || `Authentication failed with status ${response.status}`;
      console.error('Login error from server:', errorMessage);
      throw new Error(errorMessage);
    }

    // Success - return the parsed data
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 