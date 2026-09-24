import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)" }}
    >
      <div className="card shadow-lg p-4 p-md-5 rounded-4" style={{ minWidth: "350px", maxWidth: "400px" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "600", color: "#333" }}>
          Register As
        </h3>

        <button
          className="btn btn-success w-100 mb-3"
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
          onClick={() => navigate("/register-user")}
        >
          👤 User Registration
        </button>

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
          onClick={() => navigate("/register-admin")}
        >
          🛡 Admin Registration
        </button>

        <p className="text-center mt-4" style={{ fontSize: "0.9rem", color: "#555" }}>
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
