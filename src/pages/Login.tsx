import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Login page component
 * Handles user authentication through Auth0
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, backendError } = useAuth();
  const { error: auth0Error } = useAuth0();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show notifications for auth errors
  useEffect(() => {
    if (auth0Error) {
      showNotification(`Authentication error: ${auth0Error.message}`, 'error');
    }
    if (backendError) {
      showNotification(`Backend error: ${backendError}`, 'error');
    }
  }, [auth0Error, backendError, showNotification]);

  /**
   * Handle login button click
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginError(null);
      login('/'); // Redirect to home page after login
    } catch (error: any) {
      showNotification(error.message || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {loginError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Auth0
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Auth0 Domain: {process.env.REACT_APP_AUTH0_DOMAIN}</p>
            <p>API URL: {process.env.NODE_ENV === 'development' 
              ? process.env.REACT_APP_API_URL_DEV 
              : process.env.REACT_APP_API_URL_PROD}</p>
            <p>Redirect URI: {process.env.NODE_ENV === 'development' 
              ? process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV 
              : process.env.REACT_APP_AUTH0_REDIRECT_URI}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
