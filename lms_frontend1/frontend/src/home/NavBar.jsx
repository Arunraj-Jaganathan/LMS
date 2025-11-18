import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";

function NavBar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");
      setIsLoggedIn(!!token);
      setRole(userRole || "");
    };

    window.addEventListener("authChange", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("authChange", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("authChange"));
    setIsLoggedIn(false);
    setRole("");
    navigate("/");
  };

  return (
    <nav className="nav">
      <img
        src={logo}
        alt="Logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      />
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>

        {/* Only for Admins */}
        {isLoggedIn && role === "ROLE_ADMIN" && (
          <li>
            <Link to="/adminops" className="admin-btn">AdminOps</Link>
          </li>
        )}

        {/* Logout Button */}
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
