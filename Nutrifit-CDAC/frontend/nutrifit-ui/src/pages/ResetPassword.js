import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // token from query string
  const navigate = useNavigate();

  const [data, setData] = useState({ newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      // Call backend API to reset password
      await api.post("/auth/reset-password", { 
        token, 
        newPassword: data.newPassword, 
        confirmPassword: data.confirmPassword 
      });

      setMsg("Password reset successfully!");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100" 
      style={{ background: "#f0f4f8" }}
    >
      <div 
        className="card shadow-lg p-4 rounded-4" 
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="text-center mb-4">Reset Password</h3>

        {/* Display message */}
        {msg && <div className="alert alert-info py-2">{msg}</div>}

        {/* New Password Field */}
        <div className="mb-3 position-relative">
          <input
            type={showNewPassword ? "text" : "password"}
            className="form-control"
            placeholder="New Password"
            value={data.newPassword}
            onChange={e => setData({ ...data, newPassword: e.target.value })}
          />
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            <i className={showNewPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
          </span>
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4 position-relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="form-control"
            placeholder="Confirm New Password"
            value={data.confirmPassword}
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
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <i className={showConfirmPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
          </span>
        </div>

        {/* Reset Button */}
        <button 
          className="btn btn-primary w-100"
          style={{ fontWeight: "500", borderRadius: "6px" }}
          onClick={handleSubmit}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
