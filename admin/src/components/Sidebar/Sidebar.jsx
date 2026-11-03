import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import "./Sidebar.css";

// ==========================================
// RIDWAN BUSINESS
// PREMIUM ADMIN SIDEBAR
// ==========================================

// Navigation icons

const SidebarIcon = ({ type }) => {
  const commonProps = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "add":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
          />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );

    case "products":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1.5"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1.5"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1.5"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1.5"
          />
        </svg>
      );

    case "orders":
      return (
        <svg {...commonProps}>
          <path d="M8 4h8" />
          <path d="M9 2h6v4H9z" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
          <path d="M9 12h7" />
          <path d="M9 16h7" />
        </svg>
      );

    default:
      return null;
  }
};

// ==========================================
// NAVIGATION ITEMS
// ==========================================

const navigationItems = [
  {
    path: "/add",
    title: "Add Product",
    description: "Create new listings",
    icon: "add",
  },
  {
    path: "/list",
    title: "Manage Products",
    description: "View your inventory",
    icon: "products",
  },
  {
    path: "/orders",
    title: "Manage Orders",
    description: "Customer purchases",
    icon: "orders",
  },
];

// ==========================================
// SIDEBAR COMPONENT
// ==========================================

const Sidebar = () => {
  const location = useLocation();

  // Hide the sidebar on the login page.

  if (location.pathname === "/admin/login") {
    return null;
  }

  return (
    <aside
      className="sidebar"
      aria-label="Admin navigation"
    >
      {/* ====================================
          SIDEBAR BRAND
      ==================================== */}

      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          RB
        </div>

        <div className="sidebar-brand-text">
          <h2>RIDWAN</h2>
          <span>BUSINESS ADMIN</span>
        </div>
      </div>

      {/* ====================================
          NAVIGATION HEADER
      ==================================== */}

      <div className="sidebar-section-header">
        <span className="sidebar-section-line" />
        <p>MANAGEMENT</p>
      </div>

      {/* ====================================
          NAVIGATION
      ==================================== */}

      <nav
        className="sidebar-options"
        aria-label="Management pages"
      >
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-option ${
                isActive ? "active" : ""
              }`
            }
            aria-label={item.title}
          >
            <div className="sidebar-option-icon">
              <SidebarIcon type={item.icon} />
            </div>

            <div className="sidebar-option-content">
              <p className="sidebar-option-title">
                {item.title}
              </p>

              <span className="sidebar-option-description">
                {item.description}
              </span>
            </div>

            <span
              className="sidebar-option-arrow"
              aria-hidden="true"
            >
              ›
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ====================================
          SIDEBAR FOOTER
      ==================================== */}

      <div className="sidebar-footer">
        <div className="sidebar-footer-badge">
          <span className="sidebar-footer-dot" />

          <span>ADMIN WORKSPACE</span>
        </div>

        <p>
          Ridwan Business
          <br />
          Management Portal
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;