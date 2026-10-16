import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Global styles
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Main application
import App from "./App.jsx";

// Store provider
import StoreContextProvider from "./context/StoreContextProvider.jsx";

// ==========================================
// RIDWAN BUSINESS
// APPLICATION ENTRY POINT
// ==========================================

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

createRoot(rootElement).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
);