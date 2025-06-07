import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../services/api";

// Default avatar as base64 string
const defaultAvatar =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFMkU4RjAiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM5NEEzQjgiLz4KICA8cGF0aCBkPSJNNDAgMTgwQzQwIDE0MCA2NSAxMjAgMTAwIDEyMEMxMzUgMTIwIDE2MCAxNDAgMTYwIDE4MEgxODBDMTgwIDEzMCAxNDUgMTAwIDEwMCAxMDBDNTUgMTAwIDIwIDEzMCAyMCAxODBINDBaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    user?.profilePhoto || defaultAvatar
  );
  const fileInputRef = useRef(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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
      setIsLoading(true);

      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);

      // Add password fields if they are filled
      if (showPasswordFields && data.currentPassword && data.newPassword) {
        formData.append("currentPassword", data.currentPassword);
        formData.append("newPassword", data.newPassword);
      }

      if (fileInputRef.current?.files[0]) {
        formData.append("profilePhoto", fileInputRef.current.files[0]);
      }

      const response = await api.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      updateUser(response.data.data);
      toast.success("Profile updated successfully!");

      // Reset password fields and hide them
      if (showPasswordFields) {
        reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordFields(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="profile-photo-section">
          <div className="profile-photo-container" onClick={handleImageClick}>
            <img src={previewImage} alt="Profile" className="profile-photo" />
            <div className="photo-overlay">
              <span>Change Photo</span>
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className={`form-input ${errors.username ? "input-error" : ""}`}
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
          />
          {errors.username && (
            <p className="error-message">{errors.username.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? "input-error" : ""}`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="password-section">
          <button
            type="button"
            className="toggle-password-button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          >
            {showPasswordFields ? "Cancel Password Change" : "Change Password"}
          </button>

          {showPasswordFields && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  className={`form-input ${
                    errors.currentPassword ? "input-error" : ""
                  }`}
                  {...register("currentPassword", {
                    required: "Current password is required",
                  })}
                />
                {errors.currentPassword && (
                  <p className="error-message">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className={`form-input ${
                    errors.newPassword ? "input-error" : ""
                  }`}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.newPassword && (
                  <p className="error-message">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`form-input ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (value) =>
                      value === watch("newPassword") || "Passwords don't match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="error-message">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
