import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreatePost() {
  const { user } = useAuth();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    resetField,
    setValue,
  } = useForm();

  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch post data if in edit mode
  useEffect(() => {
    const fetchPost = async () => {
      if (!isEditMode) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/api/posts/${id}`);
        const post = res.data.data;

        // Set form values
        setValue("title", post.title);
        setValue("content", post.content);
        setValue("tags", post.tags?.join(", ") || "");
        setCurrentImage(post.image || "");
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setError("Failed to load post. Please try again later.");
        toast.error("Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, setValue, navigate, isEditMode]);

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

  const handleRemoveImage = () => {
    setImagePreview(null);
    setCurrentImage("");
    resetField("image");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("You must be logged in to create/edit a post");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("tags", data.tags);

      // Handle image upload
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        console.log("Adding image to form data:", fileInput.files[0]);
        formData.append("image", fileInput.files[0]);
      } else if (isEditMode && !currentImage && !imagePreview) {
        console.log("Removing image");
        formData.append("removeImage", "true");
      }

      // Log form data contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      let res;
      if (isEditMode) {
        res = await api.put(`/api/posts/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Post updated successfully!");
      } else {
        res = await api.post("/api/posts/create-post", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Post created successfully!");
      }
      navigate(`/posts/${res.data.data._id}`);
    } catch (error) {
      console.error("Post operation failed:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} post`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Post</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <h1>{isEditMode ? "Edit Post" : "Create New Post"}</h1>
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
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          {(imagePreview || currentImage) && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img
                  src={imagePreview || currentImage}
                  alt="Preview"
                  onLoad={() => console.log("Image loaded")}
                />
              </div>
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Publishing..."
              : isEditMode
              ? "Save Changes"
              : "Publish Post"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
