import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/axios';

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
  login: () => void;
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

  // Log Auth0 state for debugging
  useEffect(() => {
    console.log('Auth0 state:', { 
      isAuthenticated: auth0IsAuthenticated, 
      isLoading: auth0IsLoading,
      user: auth0User,
      error: auth0Error
    });
  }, [auth0IsAuthenticated, auth0IsLoading, auth0User, auth0Error]);

  // Fetch user profile from your backend when authenticated with Auth0
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth0IsAuthenticated && auth0User) {
        try {
          console.log('Fetching access token...');
          const token = await getAccessTokenSilently();
          console.log('Token received, length:', token.length);
          localStorage.setItem('accessToken', token);
          
          // Fetch user profile from your backend
          console.log('Fetching user profile from backend...');
          const response = await api.get('/auth/profile');
          console.log('User profile received:', response.data);
          setUser(response.data);
          setBackendError(null);
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          setBackendError(error.message || 'Failed to fetch user profile');
          
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
      }
    };

    fetchUserProfile();
  }, [auth0IsAuthenticated, auth0User, auth0IsLoading, getAccessTokenSilently]);

  const login = () => {
    setBackendError(null);
    console.log('Initiating Auth0 login...');
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: process.env.NODE_ENV === 'development'
          ? process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV || 'http://localhost:3000/callback'
          : process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin,
        scope: 'openid profile email',
        audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.exelaki.com',
      },
      appState: {
        returnTo: '/'
      }
    });
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('accessToken');
    setUser(null);
    setBackendError(null);
    auth0Logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  const getAccessToken = async () => {
    if (!auth0IsAuthenticated) {
      return undefined;
    }
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return undefined;
    }
  };

  // For debugging
  useEffect(() => {
    console.log('AuthContext state:', {
      isAuthenticated: auth0IsAuthenticated && !!user,
      user,
      auth0User,
      backendError
    });
  }, [auth0IsAuthenticated, user, auth0User, backendError]);

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