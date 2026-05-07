import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Navbar = () => {
  const token = localStorage.getItem("adminToken"); // check if logged in

  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // clear token
    toast.info("Logged out successfully", { position: "top-center" });
    setTimeout(() => {
      window.location.href = "/admin/login"; // redirect to login page
    }, 1500);
  };

  return (
    <div className="navbar">
      <img className="logo" src={assets.logo} alt="Logo" />
      <h3>Admin Panel</h3>
      <div className="navbar-right">
        <img className="profile" src={assets.profile_image} alt="Profile" />
        {/* 🔹 Only show logout if logged in */}
        {token && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
