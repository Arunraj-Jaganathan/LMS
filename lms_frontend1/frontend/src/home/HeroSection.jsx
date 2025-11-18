import { useEffect, useState } from "react";
import hero from "../assets/hero.jpg";
import { useNavigate } from "react-router-dom";

function Herosection() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("authChange", checkLogin);

    // Cleanup
    return () => window.removeEventListener("authChange", checkLogin);
  }, []);

  return (
    <div className="hero-section">
      <div className="content">
        <div className="content-inside">
          <h2>
            The Best <span className="online-word">Online</span>
            <br />
            Learning Platform You Will Find
          </h2>
          <p>
            Transform your learning into achievement. At <strong>IQ Math’s</strong>, we equip you with
            the tools to excel in academics, careers, and beyond — turning complex ideas into
            practical understanding and real success.
          </p>
        </div>

        {/* Show Login/Signup only if NOT logged in */}
        {!isLoggedIn && (
          <div className="buttons">
            <button onClick={() => navigate("/login")}>LogIn</button>
            <button onClick={() => navigate("/signup")}>SignUp</button>
          </div>
        )}
      </div>
      <img src={hero} alt="hero" />
    </div>
  );
}

export default Herosection;
