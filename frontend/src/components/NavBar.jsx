
import { Link } from "react-router-dom";
import logo from "../assets/Logo.svg";
import "../styles/Navbar.css";
import { isLoggedIn } from "../../tools/auth";
import { useEffect, useState } from "react";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setIsOpen(false);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo-img" />
          <Link to="/" className="logo-text">ELHAKIM AI</Link>
        </div>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about-us" onClick={() => setIsOpen(false)}>About Us</Link>
          {!loggedIn ? (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>My account</Link>
            </>
          ) : (
            <>
              <Link to="/results"> Results </Link>
              <Link to="/" onClick={handleLogout}>Logout</Link>
            </>
          )} 
          <Link to="/ai-check" className="btn-nav" onClick={() => setIsOpen(false)}>AI CHECK</Link>
        </nav>

        <div className="burger" onClick={() => setIsOpen(!isOpen)}>
          <div className={`bar ${isOpen ? "rotate1" : ""}`}></div>
          <div className={`bar ${isOpen ? "fade" : ""}`}></div>
          <div className={`bar ${isOpen ? "rotate2" : ""}`}></div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
