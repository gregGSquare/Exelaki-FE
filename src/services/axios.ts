import axios from "axios";

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
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API error:', error.response?.status, error.response?.data);
    
    if (error.response && error.response.status === 401) {
      // Clear the token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
