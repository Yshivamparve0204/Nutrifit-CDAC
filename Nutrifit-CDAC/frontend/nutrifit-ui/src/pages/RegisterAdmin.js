import api from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterAdmin() {
  const [data, setData] = useState({ name: "", email: "", password: "", confirmPassword: "", secretKey: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    // ✅ Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      alert("❌ Please enter a valid email address!");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("❌ Password and Confirm Password do not match!");
      return;
    }

    await api.post("/auth/register-admin", data);
    alert("Admin registered successfully. Please login.");
    navigate("/login");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)" }}
    >
      <div className="card shadow-lg p-4 p-md-5 rounded-4" style={{ minWidth: "350px", maxWidth: "450px" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "600", color: "#333" }}>
          Admin Registration
        </h3>

        {/* Name Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Full Name</label>
        <input
          className="form-control mb-3"
          placeholder="Enter your full name"
          onChange={e => setData({ ...data, name: e.target.value })}
        />

        {/* Email Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Email</label>
        <input
          className="form-control mb-3"
          placeholder="Enter your email"
          type="email"
          onChange={e => setData({ ...data, email: e.target.value })}
        />

        {/* Password Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Password</label>
        <div className="mb-3 position-relative">
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

        {/* Confirm Password Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Confirm Password</label>
        <div className="mb-3 position-relative">
          <input
            type={showConfirm ? "text" : "password"}
            className="form-control"
            placeholder="Confirm password"
            onChange={e => setData({ ...data, confirmPassword: e.target.value })}
          />
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
            onClick={() => setShowConfirm(!showConfirm)}
          >
            <i className={showConfirm ? "fa fa-eye" : "fa fa-eye-slash"}></i>
          </span>
        </div>

        {/* Secret Key Field */}
        <label className="form-label" style={{ fontWeight: "500" }}>Admin Secret Key</label>
        <input
          className="form-control mb-4"
          placeholder="Enter admin secret key"
          onChange={e => setData({ ...data, secretKey: e.target.value })}
        />

        <button
          className="btn btn-dark w-100"
          style={{
            padding: "12px",
            fontWeight: "500",
            fontSize: "1rem",
            borderRadius: "8px",
            transition: "0.3s",
            background: "linear-gradient(to right, #343a40, #23272b)"
          }}
          onMouseEnter={e => (e.target.style.background = "linear-gradient(to right, #23272b, #343a40)")}
          onMouseLeave={e => (e.target.style.background = "linear-gradient(to right, #343a40, #23272b)")}
          onClick={register}
        >
          Register Admin
        </button>

        <p className="text-center mt-3" style={{ fontSize: "0.9rem", color: "#555" }}>
          Already have an account? <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
