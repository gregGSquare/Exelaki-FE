import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSignUpClick?: () => void;
  onHomeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick, onHomeClick }) => {
  const { isAuthenticated, user, auth0User, logout } = useAuth();
  
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" onClick={onHomeClick} className="text-xl font-bold text-blue-600">
                Exelaki
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {auth0User?.picture && (
                  <img
                    src={auth0User.picture}
                    alt={auth0User.name || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {auth0User?.name || user?.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="ml-4 px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={onSignUpClick}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const HeaderWithNavigate: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return <Header onSignUpClick={handleSignUpClick} onHomeClick={handleHomeClick} />;
};

export default HeaderWithNavigate;
