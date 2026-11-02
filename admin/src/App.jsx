import React from "react";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Admin Pages
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import AdminLogin from "./pages/AdminLogin/AdminLogin";

// Notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ADMIN DASHBOARD
// ==========================================

const App = () => {
  const location = useLocation();

  // Backend API URL
  const url = import.meta.env.VITE_API_URL;

  // Check current page
  const isLoginPage = location.pathname === "/admin/login";

  // Check if admin token exists
  const hasAdminToken = Boolean(
    localStorage.getItem("adminToken")
  );

  // Default page
  const defaultRoute = hasAdminToken
    ? "/list"
    : "/admin/login";

  return (
    <div className="admin-app">

      {/* NOTIFICATIONS */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN ADMIN LAYOUT */}
      <main className="app-content">

        {/* Hide sidebar on login page */}
        {!isLoginPage && <Sidebar />}

        {/* ADMIN ROUTES */}
        <Routes>

          {/* Homepage Redirect */}
          <Route
            path="/"
            element={
              <Navigate to={defaultRoute} replace />
            }
          />

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Add Product */}
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <Add url={url} />
              </ProtectedRoute>
            }
          />

          {/* Manage Products */}
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List url={url} />
              </ProtectedRoute>
            }
          />

          {/* Manage Orders */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders url={url} />
              </ProtectedRoute>
            }
          />

          {/* Unknown Pages */}
          <Route
            path="*"
            element={
              <Navigate to={defaultRoute} replace />
            }
          />

        </Routes>

      </main>

    </div>
  );
};

export default App;