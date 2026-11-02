import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import "./AdminLogin.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ADMIN LOGIN
// ==========================================

const Icon = ({ name, size = 20 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    case "lock":
      return (
        <svg {...props}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );

    case "eye":
      return (
        <svg {...props}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );

    case "eyeOff":
      return (
        <svg {...props}>
          <path d="m3 3 18 18" />
          <path d="M10.6 6.1A11.5 11.5 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.1 3.7" />
          <path d="M6.2 6.7C3.5 8.5 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...props}>
          <path d="M4 12h16" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );

    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "box":
      return (
        <svg {...props}>
          <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
          <path d="m3 7 9 4 9-4" />
          <path d="M12 11v10" />
        </svg>
      );

    case "chart":
      return (
        <svg {...props}>
          <path d="M4 20V13" />
          <path d="M10 20V8" />
          <path d="M16 20V4" />
          <path d="M2 20h20" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// ADMIN LOGIN COMPONENT
// ==========================================

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Render backend API URL

  const API_URL = (
    import.meta.env.VITE_API_URL || ""
  ).replace(/\/+$/, "");

  // ========================================
  // HANDLE ADMIN LOGIN
  // ========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!API_URL) {
      toast.error("Admin API URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/login`,
        {
          email: email.trim(),
          password,
        },
        {
          timeout: 90000,
        }
      );

      // Verify successful authentication

      if (
        response.data?.success &&
        response.data?.token
      ) {
        // Save administrator token

        localStorage.setItem(
          "adminToken",
          response.data.token
        );

        toast.success("Welcome back, Administrator!");

        // Navigate to the admin workspace

        navigate("/add", {
          replace: true,
        });
      } else {
        toast.error(
          "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error(
        "Admin login request failed:",
        error.message
      );

      if (error.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else if (
        error.code === "ECONNABORTED"
      ) {
        toast.error(
          "The server took too long to respond. Please try again."
        );
      } else if (!error.response) {
        toast.error(
          "Unable to connect to the server. Please try again."
        );
      } else {
        toast.error(
          "Unable to log in right now. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGIN PAGE
  // ========================================

  return (
    <section className="admin-login">

      <div className="admin-login-container">

        {/* ==================================
            LEFT BRANDING PANEL
        ================================== */}

        <div className="admin-login-brand-panel">

          {/* Background Decoration */}

          <div className="admin-login-decoration decoration-one" />
          <div className="admin-login-decoration decoration-two" />

          {/* Brand */}

          <div className="admin-login-brand-header">

            <div className="admin-login-brand-logo">
              RB
            </div>

            <div>
              <h2>RIDWAN BUSINESS</h2>
              <span>MANAGEMENT PORTAL</span>
            </div>

          </div>

          {/* Main Branding Content */}

          <div className="admin-login-brand-content">

            <div className="admin-login-eyebrow">
              <span className="admin-login-eyebrow-line" />
              ADMIN WORKSPACE
            </div>

            <h1>
              Your business.
              <br />
              <span>Your control.</span>
            </h1>

            <p>
              Manage products, track orders, and keep
              your online store organized from one
              convenient workspace.
            </p>

            {/* Feature Highlights */}

            <div className="admin-login-features">

              <div className="admin-login-feature">

                <div className="admin-login-feature-icon">
                  <Icon name="box" size={20} />
                </div>

                <div>
                  <strong>Product Management</strong>
                  <span>
                    Organize and manage your inventory
                  </span>
                </div>

              </div>

              <div className="admin-login-feature">

                <div className="admin-login-feature-icon">
                  <Icon name="chart" size={20} />
                </div>

                <div>
                  <strong>Order Management</strong>
                  <span>
                    View and manage customer purchases
                  </span>
                </div>

              </div>

              <div className="admin-login-feature">

                <div className="admin-login-feature-icon">
                  <Icon name="shield" size={20} />
                </div>

                <div>
                  <strong>Restricted Access</strong>
                  <span>
                    Available to authorized administrators
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Branding Footer */}

          <div className="admin-login-brand-footer">

            <span className="admin-login-footer-line" />

            <p>
              RIDWAN BUSINESS
              <span> • </span>
              ADMIN PORTAL
            </p>

          </div>

        </div>

        {/* ==================================
            RIGHT LOGIN PANEL
        ================================== */}

        <div className="admin-login-form-panel">

          <div className="admin-login-form-content">

            {/* Login Header */}

            <div className="admin-login-form-header">

              <div className="admin-login-header-icon">
                <Icon name="shield" size={26} />
              </div>

              <span className="admin-login-welcome-label">
                ADMINISTRATOR ACCESS
              </span>

              <h2>Welcome back</h2>

              <p>
                Sign in to access your Ridwan Business
                management dashboard.
              </p>

            </div>

            {/* ==================================
                LOGIN FORM
            ================================== */}

            <form
              className="admin-login-form"
              onSubmit={handleLogin}
            >

              {/* Email */}

              <div className="admin-login-field">

                <label htmlFor="admin-email">
                  Email Address
                </label>

                <div className="admin-login-input-wrapper">

                  <span className="admin-login-input-icon">
                    <Icon name="mail" size={20} />
                  </span>

                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your admin email"
                    autoComplete="username"
                    required
                    disabled={loading}
                  />

                </div>

              </div>

              {/* Password */}

              <div className="admin-login-field">

                <div className="admin-login-label-row">
                  <label htmlFor="admin-password">
                    Password
                  </label>
                </div>

                <div className="admin-login-input-wrapper">

                  <span className="admin-login-input-icon">
                    <Icon name="lock" size={20} />
                  </span>

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="admin-login-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    <Icon
                      name={
                        showPassword
                          ? "eyeOff"
                          : "eye"
                      }
                      size={20}
                    />
                  </button>

                </div>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                className="admin-login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="admin-login-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <Icon name="arrow" size={20} />
                  </>
                )}

              </button>

            </form>

            {/* Login Footer */}

            <div className="admin-login-form-footer">

              <Icon name="lock" size={16} />

              <p>
                This portal is for authorized
                administrators only.
              </p>

            </div>

          </div>

          {/* Bottom Footer */}

          <div className="admin-login-bottom-footer">
            <p>
              © {new Date().getFullYear()} Ridwan Business.
              All rights reserved.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default AdminLogin;