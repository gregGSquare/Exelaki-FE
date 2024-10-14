import React, { useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    setLoginError(""); // Clear any previous error messages

    try {
      const token = await loginUser(email, password);
      login(token.accessToken); // Set the token in AuthContext
      console.log("Logged in successfully");
    } catch (error: any) {
      setLoginError(error.message || "Login failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('I should navigate to welcome page from login');
      navigate("/", { replace: true }); // Redirect to the welcome page after successful login
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Login</h2>
      {loginError && <div className="text-red-500">{loginError}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
