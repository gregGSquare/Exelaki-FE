import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSignUpClick?: () => void;
  onHomeClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick, onHomeClick }) => {
  const { isAuthenticated, user, auth0User, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Track scroll position to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              onClick={onHomeClick} 
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className={`text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-90'
              }`}>
                Exelaki
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-md transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/" className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-md transition-colors">
                Budgets
              </Link>
            )}
            <Link to="/features" className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 rounded-md transition-colors">
              Features
            </Link>
          </nav>
          
          {/* User Menu or Auth Buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 pr-2">
                  {auth0User?.picture ? (
                    <img
                      src={auth0User.picture}
                      alt={auth0User.name || 'User'}
                      className="h-8 w-8 rounded-full ring-2 ring-white"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                      {(auth0User?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-neutral-700 hidden lg:inline-block">
                    {auth0User?.name || user?.email}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-sm transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={onSignUpClick}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="ml-4 md:hidden rounded-md p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-xl mx-4 mt-1 overflow-hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
              >
                Budgets
              </Link>
            )}
            <Link 
              to="/features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
            >
              Features
            </Link>
          </div>
          {isAuthenticated && (
            <div className="pt-4 pb-3 border-t border-neutral-200">
              <div className="flex items-center px-5">
                {auth0User?.picture ? (
                  <img
                    src={auth0User.picture}
                    alt={auth0User.name || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                    {(auth0User?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-neutral-800">
                    {auth0User?.name || user?.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
