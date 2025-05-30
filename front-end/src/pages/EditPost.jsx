import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm();

  const [currentImage, setCurrentImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        const post = res.data.data;

        // Set form values
        setValue("title", post.title);
        setValue("content", post.content);
        setValue("tags", post.tags?.join(", ") || "");
        setCurrentImage(post.image || "");
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast.error("Failed to load post");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, setValue, navigate]);

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
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("tags", data.tags);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      } else if (!currentImage) {
        formData.append("removeImage", "true");
      }

      await api.put(`/api/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading post...</div>;
  }

  return (
    <div className="edit-post-container">
      <h1>Edit Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className={`form-input ${errors.title ? "input-error" : ""}`}
            {...register("title", { required: "Title is required" })}
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
            rows={10}
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
            placeholder="technology, programming, webdev"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Featured Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register("image")}
            onChange={handleImageChange}
            ref={fileInputRef}
          />

          {(imagePreview || currentImage) && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview || currentImage} alt="Preview" />
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
          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
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
