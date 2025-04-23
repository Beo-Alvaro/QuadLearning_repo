// Create a proxy for the auth endpoint
import fetch from 'node-fetch';
import https from 'https';

// This is a serverless function that Vercel will use to handle the auth endpoint
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed, only POST requests are accepted' });
  }
  
  console.log('Auth proxy received request:', {
    method: req.method,
    headers: req.headers,
    body: typeof req.body === 'object' ? 'Has body object' : 'No body'
  });
  
  try {
    // Create HTTPS agent that ignores SSL certificate issues
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    // Forward the request to the backend
    const response = await fetch('https://147.93.29.231:5000/api/users/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body),
      agent
    });
    
    console.log('Auth proxy received response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Get the raw text first
    const rawText = await response.text();
    
    // If empty response, return a formatted error
    if (!rawText || rawText.trim() === '') {
      console.error('Empty response from backend server');
      return res.status(500).json({
        message: 'Backend server returned an empty response',
        status: response.status
      });
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return res.status(500).json({
        message: 'Failed to parse backend response as JSON',
        rawResponse: rawText.substring(0, 500), // Only return part of the response for debugging
        status: response.status
      });
    }
    
    // Forward the status code and response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Auth proxy error:', error);
    return res.status(500).json({ 
      message: 'Failed to connect to authentication server', 
      error: error.message 
    });
  }
} 