import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Default avatar as base64 string (same as in Profile.jsx)
const defaultAvatar =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFMkU4RjAiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5NEEzQjgiLz4KICA8cGF0aCBkPSJNNDAgMTgwQzQwIDE0MCA2NSAxMjAgMTAwIDEyMEMxMzUgMTIwIDE2MCAxNDAgMTYwIDE4MEgxODBDMTgwIDEzMCAxNDUgMTAwIDEwMCAxMDBDNTUgMTAwIDIwIDEzMCAyMCAxODBINDBaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(defaultAvatar);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (fileInputRef.current?.files[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      await registerUser(formData);
      toast.success("Registration successful!");
      navigate("/"); // Redirect to home after successful registration
    } catch (error) {
      console.error("Registration Failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-register-container">
      <h1 className="login-register-title">Create Your Account</h1>

      <form className="login-register-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="profile-photo-section">
          <div className="profile-photo-container" onClick={handleImageClick}>
            <img src={previewImage} alt="Profile" className="profile-photo" />
            <div className="photo-overlay">
              <span>Add Photo</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

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
