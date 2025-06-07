import { Navigate, Outlet } from "react-router-dom";

// Our custom hook for checking user authentication state
import { useAuth } from "../context/AuthContext";

// Component that takes children (protected content) as a prop
export default function PrivateRoute() {
  // Destructure user object from AuthContext will be null/undefined if user isn't logged in
  const { user } = useAuth();

  // replace: prop that prevents adding current page to the browser history
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
