import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from './client';

/**
 * Base API service interface
 */
export interface BaseApiService {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * Creates a base API service for a specific feature
 * @param baseUrl - Optional base URL for the service
 * @param client - Optional custom Axios instance
 * @returns Base API service
 */
export const createApiService = (
  baseUrl: string = '',
  client: AxiosInstance = apiClient
): BaseApiService => {
  return {
    /**
     * Perform a GET request
     * @param url - The URL to request
     * @param config - Optional Axios request config
     * @returns Promise with the response data
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response: AxiosResponse<T> = await client.get(`${baseUrl}${url}`, config);
      return response.data;
    },
    
    /**
     * Perform a POST request
     * @param url - The URL to request
     * @param data - The data to send
     * @param config - Optional Axios request config
     * @returns Promise with the response data
     */
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: AxiosResponse<T> = await client.post(`${baseUrl}${url}`, data, config);
      return response.data;
    },
    
    /**
     * Perform a PUT request
     * @param url - The URL to request
     * @param data - The data to send
     * @param config - Optional Axios request config
     * @returns Promise with the response data
     */
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: AxiosResponse<T> = await client.put(`${baseUrl}${url}`, data, config);
      return response.data;
    },
    
    /**
     * Perform a PATCH request
     * @param url - The URL to request
     * @param data - The data to send
     * @param config - Optional Axios request config
     * @returns Promise with the response data
     */
    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: AxiosResponse<T> = await client.patch(`${baseUrl}${url}`, data, config);
      return response.data;
    },
    
    /**
     * Perform a DELETE request
     * @param url - The URL to request
     * @param config - Optional Axios request config
     * @returns Promise with the response data
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response: AxiosResponse<T> = await client.delete(`${baseUrl}${url}`, config);
      return response.data;
    }
  };
}; 