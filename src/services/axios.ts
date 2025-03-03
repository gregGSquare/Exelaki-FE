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
    if ((processedError.type === 'AUTHENTICATION' || processedError.statusCode === 401) && !window._logoutTriggered) {
      // Set flag to prevent multiple redirects
      window._logoutTriggered = true;
      
      // Clear the token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(processedError);
  }
);

export default api;
