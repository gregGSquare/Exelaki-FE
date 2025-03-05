import axios from "axios";
import { handleApiError } from "../utils/errorHandler";

const isDevelopment = process.env.NODE_ENV === 'development';

// Configure the API base URL based on environment
const baseURL = isDevelopment 
  ? process.env.REACT_APP_API_URL_DEV || 'http://localhost:5000/api'
  : process.env.REACT_APP_API_URL_PROD || 'https://exelaki-be.onrender.com/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

declare global {
  interface Window {
    _logoutTriggered?: boolean;
    _tokenRefreshInProgress?: boolean;
  }
}

// Add a request interceptor to include the Auth0 token
api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  // Process request errors through our error handler
  handleApiError(error);
  return Promise.reject(error);
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Process API errors through our error handler
    const processedError = handleApiError(error);
    
    // Handle authentication errors
    if (processedError.type === 'AUTHENTICATION' || processedError.statusCode === 401) {
      console.log('Auth error detected in axios interceptor', processedError);
      
      // Clear the invalid token
      localStorage.removeItem('accessToken');
      sessionStorage.clear();
      
      // Only redirect to login if we're not already handling auth
      if (!window._logoutTriggered && 
          !window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/callback')) {
        
        console.log('Triggering logout from axios interceptor');
        window._logoutTriggered = true;
        
        // Determine the correct login URL based on environment
        const loginUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/login'
          : 'https://exelaki-fe.onrender.com/login';
          
        console.log('Redirecting to:', loginUrl);
        window.location.replace(loginUrl);
      } else {
        console.log('Not redirecting - already handling auth or on auth page');
      }
    }
    
    return Promise.reject(processedError);
  }
);

export default api;
