import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  onSignUpClick: () => void;
  onHomeClick: () => void;  // Add this prop for the home button
}

const Header: React.FC<HeaderProps> = ({ onSignUpClick, onHomeClick }) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [authState, setAuthState] = useState(isAuthenticated);

  useEffect(() => {
    setAuthState(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("isAuthenticated state:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Exelaki</h1>

      <div className="flex gap-4">
        <button onClick={onHomeClick}>Home</button>
        {!authState ? (
          location.pathname === "/signup" ? (
            <Link to="/login">
              <button>Log In</button>
            </Link>
          ) : location.pathname === "/login" ? (
            <Link to="/signup">
              <button>Sign Up</button>
            </Link>
          ) : (
            <Link to="/login">
              <button>Log In</button>
            </Link>
          )
        ) : (
          <Link to="/login" onClick={logout}><button>Logout</button></Link>
        )}
      </div>
    </header>
  );
};

export default Header;
