import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

// Create authentication context object
const AuthContext = createContext();

// AuthProvider component wrapping parts of the app that needs auth access
export function AuthProvider({ children }) {
  // State to store current user info
  const [user, setUser] = useState(null);

  // State to checking auth status
  const [loading, setLoading] = useState(true);

  // useEffect to check if theres a user session (runs once when component mounts)
  useEffect(() => {
    // Function for checking if token exists & fetch user data
    const checkAuth = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem("token");

        // If token exists make request to get the current user
        if (token) {
          const res = await api.get("/api/auth/currentuser", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Save user data into state
          setUser(res.data.data);
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token"); // Clear invalid token
      } finally {
        // Stop loading whether check succeed or failed
        setLoading(false);
      }
    };

    // Check Auth
    checkAuth();
  }, []); // Empty dependency array = Run only once on mount

  // Login handler
  const login = async (email, password) => {
    try {
      const requestBody = {
        email,
        password,
      };

      const res = await api.post("/api/auth/login", requestBody);

      // Save received token in localStorage
      localStorage.setItem("token", res.data.token);

      // Save user data in state
      setUser({
        _id: res.data.user._id,
        username: res.data.user.username,
        email: res.data.user.email,
        profilePhoto: res.data.user.profilePhoto,
      });

      // Set the default authorization header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
    } catch (error) {
      // Remove any existing token and user data
      localStorage.removeItem("token");
      setUser(null);
      // Re-throw the error to be handled by the component
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem("token");

    // Clear user state
    setUser(null);
  };

  // Register handler
  const register = async (username, email, password) => {
    const requestBody = {
      username,
      email,
      password,
    };

    const res = await api.post("/api/auth/register", requestBody);

    // Save token & user data in localStorage & state
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // - Return the provider with values accessible by child components
  // - This part returns "Context Provider" which shares data ie: user data with other components in your app
  // eg: Hey app heres the "AuthContext.Provider" where i stored the login stuff.Don't show the actual app (children) until we finish checking if user is logged in.
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {/* Only render children after loading is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Shortcut function for getting access to the auth stuff
export const useAuth = () => useContext(AuthContext);
