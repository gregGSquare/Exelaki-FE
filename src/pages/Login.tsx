import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from '../contexts/NotificationContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, backendError } = useAuth();
  const { error: auth0Error } = useAuth0();
  const { showNotification } = useNotification();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show errors if any
  useEffect(() => {
    if (auth0Error) {
      showNotification(`Authentication error: ${auth0Error.message}`, 'error');
    }
    if (backendError) {
      showNotification(`Backend error: ${backendError}`, 'error');
    }
  }, [auth0Error, backendError, showNotification]);

  // Automatically redirect to Auth0 login when the component mounts
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      login({ screen_hint: 'login' });
    }
  }, [isAuthenticated, isLoading, login]);

  // Show loading state while redirecting
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

        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
