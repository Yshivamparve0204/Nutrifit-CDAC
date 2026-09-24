import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark navbar-expand-lg px-3">
      <Link className="navbar-brand" to="/">NutriFit</Link>

      <div className="ms-auto">
        {!token ? (
          <>
            <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
            <Link className="btn btn-warning" to="/register">Register</Link>
          </>
        ) : (
          <>
            {role === "admin" && (
              <Link className="btn btn-warning me-2" to="/admin">Admin Panel</Link>
            )}

            {role === "user" && (
              <Link className="btn btn-outline-info me-2" to="/profile">Profile</Link>
            )}

            <button className="btn btn-danger" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}