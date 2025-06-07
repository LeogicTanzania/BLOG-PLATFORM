import { useForm } from "react-hook-form"; // Form hook for managing form state & validation
import { useAuth } from "../context/AuthContext"; // For accessing authentication Logic
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

// Login component
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const onSubmit = async ({ email, password }) => {
    try {
      setLoginError(""); // Clear any previous errors
      await login(email, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login Failed:", error);
      // Show error message from the server response
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setLoginError("Incorrect Credentials!");
    }
  };

  return (
    <div className="login-register-container">
      <h1 className="login-register-title">Login Your Account</h1>
      <form className="login-register-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <input
            className={`form-input ${errors.email ? "input-error" : ""}`}
            // This creates input field named 'email' makes it required & lets react-hook-form manage its value, validation & events automatically
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Email"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <input
            className={`form-input ${errors.password ? "input-error" : ""}`}
            // This creates input field named 'password' makes it required & lets react-hook-form manage its value, validation & events automatically
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type="password"
            placeholder="Password"
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="login-register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {loginError && (
          <p
            className="error-message"
            style={{ textAlign: "center", marginTop: "10px" }}
          >
            <b>{loginError}</b>
          </p>
        )}
      </form>
      <p className="login-link">
        Don't have an account? <a href="/register">Create Account</a>
      </p>
    </div>
  );
}
