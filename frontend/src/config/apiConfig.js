// API base URL configuration
const apiConfig = {
  // Development environment (local)
  baseUrlDev: 'http://localhost:5000/api',
  
  // Production environment (Railway deployed backend)
  baseUrlProd: 'https://tropicalvillageportal-production.up.railway.app/api',
  
  // Get the appropriate base URL based on the environment
  getBaseUrl: () => {
    // Check if we're on Vercel production
    const isVercelProd = window.location.hostname.includes('vercel.app');
    // Check if we're in production mode
    const isProd = import.meta.env.PROD || isVercelProd;
    
    return isProd ? apiConfig.baseUrlProd : apiConfig.baseUrlDev;
  }
};

export default apiConfig; 