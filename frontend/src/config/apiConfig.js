// API base URL configuration
const apiConfig = {
  // Development environment (local)
  baseUrlDev: 'http://localhost:5000/api',
  
  // Production environment (Railway deployed backend)
  baseUrlProd: 'https://tropicalvillageportal-production.up.railway.app/api',
  
  // Get the appropriate base URL based on the environment
  getBaseUrl: () => {
    return import.meta.env.MODE === 'production' 
      ? apiConfig.baseUrlProd 
      : apiConfig.baseUrlDev;
  }
};

export default apiConfig; 