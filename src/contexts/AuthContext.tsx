import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { handleApiError } from '../utils/errorHandler';
import { 
  storeAccessToken, 
  removeAccessToken, 
  mapAuth0UserToAppUser 
} from '../core/utils/auth0';
import { 
  User, 
  Auth0User, 
  AuthContextValue 
} from '../core/types/auth';
import { getLoginConfig, getLogoutConfig } from '../core/config/auth0';
import { authService } from '../core/services';

// Create the auth context with undefined default value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component
 * Manages authentication state and provides auth-related functionality
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated: auth0IsAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    user: auth0User,
    isLoading: auth0IsLoading,
    error: auth0Error
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Fetch user profile from your backend when authenticated with Auth0
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth0IsAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          storeAccessToken(token);
          
          // Fetch user profile from your backend
          const userData = await authService.getProfile();
          setUser(userData);
          setBackendError(null);
        } catch (error: any) {
          const processedError = handleApiError(error);
          setBackendError(processedError.message);
          
          // If we can't get the profile but we're authenticated with Auth0,
          // we should still consider the user authenticated with a mapped user object
          if (!user && auth0User) {
            setUser(mapAuth0UserToAppUser(auth0User));
          }
        } finally {
          setIsLoading(false);
        }
      } else if (!auth0IsLoading) {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [auth0IsAuthenticated, auth0User, auth0IsLoading, getAccessTokenSilently]);

  /**
   * Initiate the login process
   * @param returnTo - Optional URL to redirect to after login
   */
  const login = (returnTo?: string) => {
    setBackendError(null);
    loginWithRedirect(getLoginConfig(returnTo));
  };

  /**
   * Logout the user
   * @param returnTo - Optional URL to redirect to after logout
   */
  const logout = (returnTo?: string) => {
    removeAccessToken();
    setUser(null);
    setBackendError(null);
    auth0Logout(getLogoutConfig(returnTo));
  };

  /**
   * Get the access token
   * @returns The access token or undefined if not authenticated
   */
  const getAccessToken = async () => {
    if (!auth0IsAuthenticated) {
      return undefined;
    }
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      handleApiError(error);
      return undefined;
    }
  };

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    setBackendError(null);
  };

  // Context value
  const value: AuthContextValue = {
    isAuthenticated: auth0IsAuthenticated && !!user,
    isLoading: isLoading || auth0IsLoading,
    user,
    auth0User: auth0User as Auth0User | null,
    backendError,
    login,
    logout,
    getAccessToken,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns The auth context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};