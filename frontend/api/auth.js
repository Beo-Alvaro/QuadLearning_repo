// Create a proxy for the auth endpoint
import { createProxyMiddleware } from 'http-proxy-middleware';
import fetch from 'node-fetch';

// This is a serverless function that Vercel will use to handle the auth endpoint
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed, only POST requests are accepted' });
  }
  
  try {
    // Forward the request to the backend
    const response = await fetch('https://147.93.29.231:5000/api/users/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
      // Ignore SSL certificate issues
      agent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });
    
    // Get the response data
    const data = await response.json();
    
    // Forward the status code and response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Auth proxy error:', error);
    res.status(500).json({ 
      message: 'Failed to connect to authentication server', 
      error: error.message 
    });
  }
} 