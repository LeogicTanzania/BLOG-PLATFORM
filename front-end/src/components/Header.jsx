// Link component for client-side navigation
import { Link } from "react-router-dom";
import { useState } from "react";

// Our custom hook to access user data & logout function
import { useAuth } from "../context/AuthContext";

// Header component
export default function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Render the component
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-logo">
          LEOGIC BLOGS
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="menu-icon"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          {/* If user is logged in, show 'New Post', 'Profile' & 'LogOut' */}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
