import { Link } from "react-router-dom";

function Footer() {
  const primaryColor = "#2980b9";

  const footerStyle = {
    background: "#ffffff",
    boxShadow: "0 -5px 20px rgba(0, 0, 0, 0.08)",
    padding: "40px 20px",
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    textAlign: "center",
    marginTop: "50px",
    fontFamily: "Arial, sans-serif",
  };

  const linkStyle = {
    margin: "0 12px",
    color: primaryColor,
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s ease",
  };

  const hoverStyle = {
    color: "#1c5980",
  };

  return (
    <footer style={footerStyle}>
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "10px",
          color: primaryColor,
          fontWeight: "700",
        }}
      >
        IQ Math's Online Learning Platform
      </h2>

      <p
        style={{
          fontSize: "0.95rem",
          color: "#000000",
          marginBottom: "20px",
        }}
      >
        Empower your skills with our curated courses and become industry-ready.
      </p>

      {/* Fixed: Use React Router <Link> for internal navigation */}
      <div style={{ marginBottom: "20px" }}>
        {[
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" },
          { name: "About", path: "/about" },
          { name: "Contact", path: "/contact" },
        ].map((link) => (
          <Link
            key={link.name}
            to={link.path}
            style={linkStyle}
            onMouseEnter={(e) => (e.target.style.color = hoverStyle.color)}
            onMouseLeave={(e) => (e.target.style.color = linkStyle.color)}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <p style={{ fontSize: "0.85rem", color: "#555555" }}>
        © 2025 IQ Math's Online Learning Platform. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
