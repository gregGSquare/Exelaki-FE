import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from '../utils/auth0';
import { handleApiError, ErrorType, isErrorType } from '../errors';
import { DEFAULT_RETRY_CONFIG, RetryConfig, executeWithRetry } from './retry';

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
  retry: DEFAULT_RETRY_CONFIG
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
      // Process request errors
      const processedError = handleApiError(error);
      return Promise.reject(processedError);
    }
  );
  
  // Add response interceptor to handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      // Process API errors through our error handler
      const processedError = handleApiError(error);
      
      // Handle authentication errors
      if (isErrorType(processedError, ErrorType.AUTHENTICATION) && !window._logoutTriggered) {
        // Set flag to prevent multiple redirects
        window._logoutTriggered = true;
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject(processedError);
    }
  );
  
  // Create a wrapped client with retry functionality
  const wrappedClient = {
    ...client,
    
    // Override request method to add retry functionality
    request: <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.request<T>(config), API_CONFIG.retry);
    },
    
    // Override get method
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.get<T>(url, config), API_CONFIG.retry);
    },
    
    // Override post method
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.post<T>(url, data, config), API_CONFIG.retry);
    },
    
    // Override put method
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.put<T>(url, data, config), API_CONFIG.retry);
    },
    
    // Override patch method
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.patch<T>(url, data, config), API_CONFIG.retry);
    },
    
    // Override delete method
    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return executeWithRetry(() => client.delete<T>(url, config), API_CONFIG.retry);
    }
  };
  
  return wrappedClient as AxiosInstance;
};

// Export a singleton instance
export const apiClient = createApiClient(); 