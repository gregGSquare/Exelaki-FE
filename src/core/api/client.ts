import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from '../utils/auth0';
import { handleApiError, ErrorType } from '../../utils/errorHandler';

/**
 * API configuration
 */
export const API_CONFIG = {
  // Base URL based on environment
  baseURL: process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_URL_DEV || 'http://localhost:5000/api'
    : process.env.REACT_APP_API_URL_PROD || 'https://exelaki-be.onrender.com/api',
  
  // Default headers
  headers: {
    'Content-Type': 'application/json'
  },
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Retry configuration
  retry: {
    // Maximum number of retries
    maxRetries: 3,
    
    // Base delay between retries in milliseconds
    baseDelay: 1000,
    
    // Status codes that should trigger a retry
    statusCodesToRetry: [408, 429, 500, 502, 503, 504],
  }
};

/**
 * Flag to prevent multiple logout redirects
 */
declare global {
  interface Window {
    _logoutTriggered?: boolean;
  }
}

/**
 * Creates and configures an Axios instance for API requests
 */
export const createApiClient = (): AxiosInstance => {
  // Create Axios instance with configuration
  const client = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: API_CONFIG.headers,
    timeout: API_CONFIG.timeout
  });
  
  // Add request interceptor to include auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      // Process API errors through our error handler
      const processedError = handleApiError(error);
      
      // Handle authentication errors
      if (processedError.type === ErrorType.AUTHENTICATION && !window._logoutTriggered) {
        // Set flag to prevent multiple redirects
        window._logoutTriggered = true;
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject(processedError);
    }
  );
  
  return client;
};

// Export a singleton instance
export const apiClient = createApiClient(); 