import api from "./axios";
import { setTokens } from "../utils/tokenUtils";

export const registerUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/register", { 
      email, 
      password 
    });
    
    if (response.data && response.data.accessToken) {
      setTokens(response.data.accessToken);
      return response.data;
    } else {
      throw new Error("No token found in the response");
    }
  } catch (error: any) {
    console.error("Error registering user:", error);
    throw new Error(error.response?.data.message || "Registration failed");
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.data) {
      const { accessToken } = response.data;
      setTokens(accessToken);
      return response.data;
    } else {
      throw new Error("No token found in the response");
    }
  } catch (error: any) {
    console.error("Error logging in:", error);
    throw new Error(error.response?.data.message || "Login failed");
  }
};

export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/auth/refresh-token");
    if (response.data) {
      const { accessToken } = response.data;
      setTokens(accessToken);
      return accessToken;
    } else {
      throw new Error("No token found in the refresh response");
    }
  } catch (error: any) {
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh token");
  }
};
