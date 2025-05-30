import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreatePost() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setValue,
  } = useForm();

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("tags", data.tags);
    if (data.image[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      const res = await api.post("/api/posts/create-post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post created Successfully!");
      navigate(`/posts/${res.data.data._id}`);
    } catch (error) {
      console.error("Post Creation Failed:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileInputRef = useRef(null);
  const handleRemoveImage = () => {
    setImagePreview(null);

    resetField("image");

    setValue("image", null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="create-post-container">
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className={`form-input ${errors.title ? "input-error" : ""}`}
            {...register("title", { required: "Title is required" })}
            placeholder="Enter post title"
          />
          {errors.title && (
            <p className="error-message">{errors.title.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            className={`form-input ${errors.content ? "input-error" : ""}`}
            {...register("content", { required: "Content is required" })}
            placeholder="Write your post content..."
            rows={8}
          />
          {errors.content && (
            <p className="error-message">{errors.content.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            id="tags"
            className="form-input"
            {...register("tags")}
            placeholder="e.g., technology, programming, webdev"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Featured Image (optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register("image")}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  onLoad={() => console.log("Image loaded")}
                />
              </div>
              <button
                className="remove-image-btn"
                onClick={() => {
                  handleRemoveImage();
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
