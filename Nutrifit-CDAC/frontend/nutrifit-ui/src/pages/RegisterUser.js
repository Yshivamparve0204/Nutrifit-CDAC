import api from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const [data, setData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    // ✅ Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!emailRegex.test(data.email)) {
      alert("❌ Please enter a valid email address!");
      return;
    }

      if (!passwordRegex.test(data.password)) {
    alert("❌ Password must be at least 8 characters long and contain both letters and numbers!");
    return;
  }

    if (data.password !== data.confirmPassword) {
      alert("❌ Password and Confirm Password do not match!");
      return;
    }

    await api.post("/auth/register-user", data);
    alert("User registered successfully. Please login.");
    navigate("/login");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)" }}
    >
      <div className="card shadow-lg p-4 p-md-5 rounded-4" style={{ minWidth: "350px", maxWidth: "450px" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "600", color: "#333" }}>
          User Registration
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
        <div className="mb-4 position-relative">
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

        <button
          className="btn btn-success w-100"
          style={{
            padding: "12px",
            fontWeight: "500",
            fontSize: "1rem",
            borderRadius: "8px",
            transition: "0.3s",
            background: "linear-gradient(to right, #28a745, #218838)"
          }}
          onMouseEnter={e => (e.target.style.background = "linear-gradient(to right, #218838, #28a745)")}
          onMouseLeave={e => (e.target.style.background = "linear-gradient(to right, #28a745, #218838)")}
          onClick={register}
        >
          Register
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
