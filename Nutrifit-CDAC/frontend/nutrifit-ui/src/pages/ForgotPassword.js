import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data);
    } catch (err) {
      setMsg(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "#f0f4f8" }}>
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center mb-4">Forgot Password</h3>

        {msg && <div className="alert alert-info">{msg}</div>}

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
