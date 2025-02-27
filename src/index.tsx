import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById('root');

if (rootElement) {
  const reactRoot = ReactDOM.createRoot(rootElement);
  reactRoot.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
} else {
  document.body.innerHTML = '<div style="text-align: center; padding: 20px;">Failed to initialize the application. Please refresh the page or contact support.</div>';
}

reportWebVitals();