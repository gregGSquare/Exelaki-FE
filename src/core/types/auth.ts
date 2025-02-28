/**
 * Auth Types
 * This file contains type definitions for authentication-related data
 */

/**
 * Application user model
 */
export interface User {
  _id: string;
  email: string;
  isAuth0User: boolean;
  auth0Id?: string;
  name?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Auth0 user profile
 * This is a partial interface for the Auth0 user profile
 */
export interface Auth0User {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Authentication context state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  auth0User: Auth0User | null;
  backendError: string | null;
}

/**
 * Authentication context value
 */
export interface AuthContextValue extends AuthState {
  login: (returnTo?: string) => void;
  logout: (returnTo?: string) => void;
  getAccessToken: () => Promise<string | undefined>;
  clearError: () => void;
} 