import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = { username, password };

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (res.ok) {
        localStorage.setItem("token", text);

        try {
          const payloadData = JSON.parse(atob(text.split(".")[1]));
          localStorage.setItem("role", payloadData.role || "ROLE_USER");
        } catch (err) {
          console.warn("Couldn't decode JWT:", err);
        }

        window.dispatchEvent(new Event("authChange"));
        setPopup({ show: true, message: "Login Successful!", type: "success" });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
          navigate("/");
        }, 2000);
      } else {
        setPopup({ show: true, message: "Invalid Username or Password", type: "error" });
        setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setPopup({ show: true, message: "Login Failed. Please try again.", type: "error" });
      setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Simple Top-Right Popup */}
      {popup.show && (
        <div className={`popup-top-right ${popup.type}`}>
          <span className="popup-icon">
            {popup.type === "success" ? "✅" : "❌"}
          </span>
          <p>{popup.message}</p>
        </div>
      )}
    </div>
  );
}

export default Login;
