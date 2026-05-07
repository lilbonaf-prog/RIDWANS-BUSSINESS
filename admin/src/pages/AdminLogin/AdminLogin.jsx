import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://api.ridwanbusiness.com/api/admin/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        toast.success("Login successful! Redirecting...", { position: "top-center" });
        setTimeout(() => {
          window.location.href = "/add"; // redirect after login
        }, 1500);
      } else {
        toast.error("Login failed. Please try again.", { position: "top-center" });
      }
    } catch {
      toast.error("Invalid credentials. Please try again.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
