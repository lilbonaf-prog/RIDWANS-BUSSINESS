import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { assets } from "../../assets/assets";

import "./Navbar.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ADMIN NAVBAR
// ==========================================

const pageInformation = {
  "/add": {
    title: "Add Product",
    subtitle: "Create and publish new products",
  },

  "/list": {
    title: "Manage Products",
    subtitle: "Organize your store inventory",
  },

  "/orders": {
    title: "Manage Orders",
    subtitle: "Track and manage customer orders",
  },

  "/admin/login": {
    title: "Admin Login",
    subtitle: "Secure administrator access",
  },
};

// ==========================================
// LOGOUT ICON
// ==========================================

const LogoutIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

      <path d="M16 17l5-5-5-5" />

      <path d="M21 12H9" />
    </svg>
  );
};

// ==========================================
// NAVBAR COMPONENT
// ==========================================

const Navbar = () => {
  const navigate = useNavigate();

  const location = useLocation();

  // Get current page information

  const currentPage =
    pageInformation[location.pathname] || {
      title: "Admin Dashboard",
      subtitle: "Ridwan Business management center",
    };

  // Check administrator login status

  const token = localStorage.getItem("adminToken");

  const isAuthenticated = Boolean(token);

  const isLoginPage =
    location.pathname === "/admin/login";

  // ========================================
  // ADMINISTRATOR LOGOUT
  // ========================================

  const handleLogout = () => {
    // Remove administrator token

    localStorage.removeItem("adminToken");

    // Show confirmation

    toast.info("Logged out successfully", {
      position: "top-center",
      autoClose: 2000,
    });

    // Redirect administrator to login

    navigate("/admin/login", {
      replace: true,
    });
  };

  // ========================================
  // NAVBAR
  // ========================================

  return (
    <header className="navbar">

      {/* ====================================
          LEFT: BUSINESS BRANDING
      ==================================== */}

      <div className="navbar-brand">

        <div className="navbar-logo-wrapper">
          <img
            className="logo"
            src={assets.logo}
            alt="Ridwan Business"
          />
        </div>

        <div className="navbar-brand-details">
          <h2>RIDWAN BUSINESS</h2>

          <span>ADMIN MANAGEMENT</span>
        </div>

      </div>

      {/* ====================================
          CENTER: CURRENT PAGE
      ==================================== */}

      <div className="navbar-page-info">

        <span className="navbar-page-label">
          MANAGEMENT CONSOLE
        </span>

        <h1 className="navbar-page-title">
          {currentPage.title}
        </h1>

        <p className="navbar-page-subtitle">
          {currentPage.subtitle}
        </p>

      </div>

      {/* ====================================
          RIGHT: ADMIN PROFILE
      ==================================== */}

      <div className="navbar-right">

        {isAuthenticated && !isLoginPage ? (
          <>

            {/* Administrator Status */}

            <div className="navbar-status">

              <span className="navbar-status-dot" />

              <span>Admin Online</span>

            </div>

            {/* Administrator Profile */}

            <div className="navbar-profile">

              <div className="navbar-profile-image">

                <img
                  className="profile"
                  src={assets.profile_image}
                  alt="Administrator profile"
                />

                <span className="navbar-profile-dot" />

              </div>

              <div className="navbar-profile-info">

                <strong>Administrator</strong>

                <span>Store Manager</span>

              </div>

            </div>

            {/* Logout Button */}

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Log out of your admin account"
            >

              <LogoutIcon />

              <span>Logout</span>

            </button>

          </>
        ) : (

          /* Login Page Information */

          <div className="navbar-login-badge">

            <span className="navbar-login-dot" />

            <span>Secure Admin Access</span>

          </div>

        )}

      </div>

    </header>
  );
};

export default Navbar;