import { createApiService } from '../api/serviceFactory';
import { User } from '../types/auth';

/**
 * Auth service response types
 */
export interface AuthProfileResponse {
  user: User;
}

/**
 * Auth service for handling authentication-related API requests
 */
export const authService = {
  /**
   * Base API service
   */
  api: createApiService('/auth'),
  
  /**
   * Get the user profile
   * @returns User profile data
   */
  async getProfile(): Promise<User> {
    const response = await this.api.get<AuthProfileResponse>('/profile');
    return response.user;
  },
  
  /**
   * Verify email
   * @param token - Verification token
   */
  async verifyEmail(token: string): Promise<void> {
    await this.api.post('/verify-email', { token });
  },
  
  /**
   * Request password reset
   * @param email - User email
   */
  async forgotPassword(email: string): Promise<void> {
    await this.api.post('/forgot-password', { email });
  },
  
  /**
   * Reset password
   * @param token - Reset token
   * @param password - New password
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await this.api.post('/reset-password', { token, password });
  },
  
  /**
   * Update user profile
   * @param userData - User data to update
   * @returns Updated user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put<{ user: User }>('/profile', userData);
    return response.user;
  }
}; 