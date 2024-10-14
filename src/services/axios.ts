import axios from "axios";
import { setTokens, getAccessToken, clearTokens } from "../utils/tokenUtils";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Include credentials to allow cookies to be sent
});

declare global {
  interface Window {
    _logoutTriggered?: boolean;
  }
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post("/auth/refresh-token");
        if (response.data) {
          const { accessToken } = response.data;
          setTokens(accessToken);
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No token found in the refresh response");
        }
      } catch (refreshError) {
        clearTokens();

        // Prevent continuous redirects
        if (!window._logoutTriggered) {
          window._logoutTriggered = true;
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
