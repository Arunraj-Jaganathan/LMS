import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ROLE_USER");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const payload = { username, email, password, role };

    try {
      const res = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate("/login");
        }, 2000);
      } else {
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 2500);
      }
    } catch (err) {
      console.error(err);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 2500);
    }
  };

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>

      {/* Success popup */}
      {showSuccessPopup && (
        <div className="popup-top-right success">
          <div className="popup-icon">✅</div>
          <p>User created successfully!</p>
        </div>
      )}

      {/* Error popup */}
      {showErrorPopup && (
        <div className="popup-top-right error">
          <div className="popup-icon">❌</div>
          <p>Signup failed. Try again.</p>
        </div>
      )}
    </div>
  );
}

export default Signup;
