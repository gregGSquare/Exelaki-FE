import React, { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async () => {
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    try {
      const token = await registerUser(email, password);
      login(token); // Set the token in AuthContext
      console.log("Registered successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Error during sign up:", error);
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path === "email") setEmailError(err.msg);
          else if (err.path === "password") setPasswordError(err.msg);
        });
      } else if (error.message) {
        setGeneralError(error.message);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {generalError && <div className="text-red-500">{generalError}</div>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {emailError && <div className="text-red-500">{emailError}</div>}
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
        {passwordError && <div className="text-red-500">{passwordError}</div>}
      </div>
      <button
        onClick={handleSignUp}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;
