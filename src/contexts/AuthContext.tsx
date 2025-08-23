import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/axios';
import { handleApiError } from '../utils/errorHandler';

interface User {
  _id: string;
  email: string;
  isAuth0User: boolean;
  auth0Id?: string;
  // Add any other user properties from your backend
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  auth0User: any;
  login: (options?: { screen_hint?: 'signup' | 'login' }) => void;
  logout: () => void;
  getAccessToken: () => Promise<string | undefined>;
  backendError: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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
          // Check if we already have a valid token
          let token = localStorage.getItem('accessToken');
          
          // If no token, try to get a new one
          if (!token) {
            token = await getAccessTokenSilently();
            if (token) {
              localStorage.setItem('accessToken', token);
            }
          }
          
          // Only try to fetch profile if we have a token
          if (token) {
            try {
              // Fetch user profile from your backend
              const response = await api.get('/auth/profile');
              setUser(response.data);
              setBackendError(null);
            } catch (error: any) {
              // If profile fetch fails due to invalid token, clear it and get a new one
              if (error.statusCode === 401) {
                localStorage.removeItem('accessToken');
                token = await getAccessTokenSilently();
                if (token) {
                  localStorage.setItem('accessToken', token);
                  // Retry profile fetch with new token
                  const retryResponse = await api.get('/auth/profile');
                  setUser(retryResponse.data);
                  setBackendError(null);
                }
              } else {
                throw error;
              }
            }
          }
        } catch (error: any) {
          const processedError = handleApiError(error);
          setBackendError(processedError.message);
          
          // If we can't get the profile but we're authenticated with Auth0,
          // we should still consider the user authenticated
          if (!user && auth0User) {
            setUser({
              _id: auth0User.sub || '',
              email: auth0User.email || '',
              isAuth0User: true,
              auth0Id: auth0User.sub || ''
            });
          }
        } finally {
          setIsLoading(false);
        }
      } else if (!auth0IsLoading) {
        setIsLoading(false);
        // Clear any existing token if we're not authenticated
        localStorage.removeItem('accessToken');
      }
    };

    fetchUserProfile();
  }, [auth0IsAuthenticated, auth0User, auth0IsLoading, getAccessTokenSilently]);

  const login = (options?: { screen_hint?: 'signup' | 'login' }) => {
    setBackendError(null);
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: process.env.NODE_ENV === 'development'
          ? process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV || 'http://localhost:3000/callback'
          : process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
        scope: 'openid profile email',
        audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.exelaki.com',
        screen_hint: options?.screen_hint,
      },
      appState: {
        returnTo: '/'
      }
    });
  };

  const logout = () => {
    // Prevent multiple logout attempts
    if (window._logoutTriggered) {
      return;
    }
    
    // Set flag to prevent multiple redirects
    window._logoutTriggered = true;
    
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear React state
    setUser(null);
    setBackendError(null);
    
    // Get Auth0 configuration
    const domain = process.env.REACT_APP_AUTH0_DOMAIN;
    const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    
    // Determine the correct returnTo URL based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const returnTo = isDevelopment 
      ? 'http://localhost:3000/signed-out'
      : 'https://exelaki-fe.onrender.com/signed-out';
    
    
    // IMPORTANT: Skip the Auth0 SDK logout method and go directly to the Auth0 logout endpoint
    // This prevents the issue where the first logout redirects to the callback URL
    if (domain && clientId) {
      // Construct a complete logout URL that will clear all Auth0 sessions
      const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`;
      
      // Force a complete page reload and navigation to the logout URL
      window.location.replace(logoutUrl);
    } else {
      // Fallback to standard Auth0 logout if domain or clientId is missing
      auth0Logout({
        logoutParams: {
          returnTo: returnTo
        }
      });
    }
  };

  const getAccessToken = async () => {
    if (!auth0IsAuthenticated) {
      return undefined;
    }
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      const processedError = handleApiError(error);
      return undefined;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth0IsAuthenticated && !!user,
        isLoading: isLoading || auth0IsLoading,
        user,
        auth0User,
        login,
        logout,
        getAccessToken,
        backendError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};