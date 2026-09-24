import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await api.post("/auth/login", data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/profile");
    } catch (e) {
      if (e.response?.status === 404) setMsg("User not found.");
      else if (e.response?.status === 401) setMsg("Invalid password.");
      else setMsg("Login failed.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)" }}
    >
      <div className="card shadow-lg p-4 p-md-5 rounded-4" style={{ minWidth: "350px", maxWidth: "450px" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "600", color: "#333" }}>
          Login
        </h3>

        {/* Error Message */}
        {msg && (
          <div className="alert alert-danger py-2 px-3" style={{ fontSize: "0.9rem" }}>
            {msg}
          </div>
        )}

        {/* Email Field */}
        <label className="form-label mt-3" style={{ fontWeight: "500" }}>Email</label>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          onChange={e => setData({ ...data, email: e.target.value })}
        />

        {/* Password Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Password</label>
        <div className="mb-2 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter password"
            onChange={e => setData({ ...data, password: e.target.value })}
          />
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
          </span>
        </div>

        {/* ✅ Forgot Password Link */}
        <div className="text-end mb-3">
          <Link to="/forgot-password" style={{ fontSize: "0.85rem", textDecoration: "none", color: "#0d6efd" }}>
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <button
          className="btn btn-primary w-100"
          style={{
            padding: "12px",
            fontWeight: "500",
            fontSize: "1rem",
            borderRadius: "8px",
            transition: "0.3s",
            background: "linear-gradient(to right, #0d6efd, #0a58ca)"
          }}
          onMouseEnter={e => (e.target.style.background = "linear-gradient(to right, #0a58ca, #0d6efd)")}
          onMouseLeave={e => (e.target.style.background = "linear-gradient(to right, #0d6efd, #0a58ca)")}
          onClick={login}
        >
          Login
        </button>

        {/* Register Link */}
        <p className="text-center mt-4" style={{ fontSize: "0.9rem", color: "#555" }}>
          New user?{" "}
          <Link to="/register" style={{ color: "#007bff", textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
