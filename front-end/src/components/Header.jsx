// Link component for client-side navigation
import { Link } from "react-router-dom";

// Our custom hook to access user data & logout function
import { useAuth } from "../context/AuthContext";

// Header component
export default function Header() {
  const { user, logout } = useAuth();

  // Render the component
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="nav-logo">
          LEOGIC BLOGS
        </Link>

        <div className="nav-links">
          {/* If user is logged in, show 'New Post', 'Profile' & 'LogOut' */}
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
