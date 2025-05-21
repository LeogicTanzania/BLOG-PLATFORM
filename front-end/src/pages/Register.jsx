import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async ({ username, email, password }) => {
    try {
      await registerUser(username, email, password);
      navigate("/"); // Redirect to home after successful registration
    } catch (error) {
      console.error("Registration Failed:", error);
    }
  };

  return (
    <div className="login-register-container">
      <h1 className="login-register-title">Create Your Account</h1>

      <form className="login-register-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <input
            className={`form-input ${errors.username ? "input-error" : ""}`}
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 4,
                message: "Username must be at least 4 characters",
              },
              maxLength: {
                value: 20,
                message: "Username cannot exceed 20 characters",
              },
            })}
            type="text"
            placeholder="Username"
          />
          {errors.username && (
            <p className="error-message">{errors.username.message}</p>
          )}
        </div>

        <div className="form-group">
          <input
            className={`form-input ${errors.email ? "input-error" : ""}`}
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

        <div className="form-group">
          <input
            className={`form-input ${
              errors.confirmPassword ? "input-error" : ""
            }`}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords don't match",
            })}
            type="password"
            placeholder="Confirm Password"
          />
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" className="login-register-button">
          Register
        </button>
      </form>
      <p className="login-link">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
