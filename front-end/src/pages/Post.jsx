import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { Link } from "react-router-dom";
import defaultAvatar from "../assets/avatar.jpg";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const viewCountedRef = useRef(false);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Handle image click
  const handleImageClick = () => {
    setIsImageModalOpen(true);
    // Reset zoom level when opening modal
    setZoomLevel(1);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  // Handle zoom controls
  const handleZoom = (direction) => {
    if (direction === "in" && zoomLevel < 3) {
      setZoomLevel((prev) => prev + 0.5);
    } else if (direction === "out" && zoomLevel > 0.5) {
      setZoomLevel((prev) => prev - 0.5);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Separate effect for fetching post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/posts/${id}`);
        setPost(res.data.data);
        setLikeCount(res.data.data.likes || 0);
        setComments(res.data.data.comments || []);

        // Check if current user has liked/bookmarked this post
        if (user) {
          setIsBookmarked(user.bookmarks?.includes(res.data.data._id) || false);
          setIsLiked(user.likedPosts?.includes(res.data.data._id) || false);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Failed to load post. Please try again later.");
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  // Separate effect for handling view count
  useEffect(() => {
    const incrementViewCount = async () => {
      if (!viewCountedRef.current && post) {
        try {
          await api.post(`/api/posts/${id}/views`);
          viewCountedRef.current = true;
        } catch (err) {
          console.error("Failed to increment view count:", err);
        }
      }
    };

    incrementViewCount();
  }, [id, post]);

  // Handle post deletion
  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/api/posts/${id}`);
        toast.success("Post deleted successfully");
        navigate("/");
      } catch (err) {
        console.error("Failed to delete post:", err);
        toast.error("Failed to delete post");
      }
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/api/posts/${id}/comments`, {
        content: newComment,
      });

      setComments([...comments, res.data.data]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.delete(`/api/posts/${id}/comments/${commentId}`);
        setComments(comments.filter((comment) => comment._id !== commentId));
        toast.success("Comment deleted successfully");
      } catch (err) {
        console.error("Failed to delete comment:", err);
        toast.error("Failed to delete comment");
      }
    }
  };

  // Handle like action
  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.delete(`/api/posts/${id}/like`);
        setLikeCount((prev) => prev - 1);
      } else {
        await api.post(`/api/posts/${id}/like`);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Failed to update like:", err);
      toast.error("Failed to update like");
    }
  };

  // Handle bookmark action
  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await api.delete(`/api/posts/${id}/bookmark`);
      } else {
        await api.post(`/api/posts/${id}/bookmark`);
      }
      setIsBookmarked(!isBookmarked);
      toast.success(
        isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
      );
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  if (loading) {
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
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="not-found">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="post-page">
      {/* Post Header */}
      <div className="post-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>{post.title}</span>
        </div>
      </div>

      {/* Post Content */}
      <article className="post-content">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-meta">
          <div className="author-info">
            <img
              src={post.author.profilePhoto || defaultAvatar}
              alt={post.author.username}
              className="author-avatar"
            />
            <div>
              <span className="author-name">{post.author.username}</span>
              <span className="post-date">
                {moment(post.createdAt).format("MMM D, YYYY")}
              </span>
            </div>
          </div>

          <div className="post-stats">
            <span>{post.views || 0} views</span>
            <span>{comments.length} comments</span>
            <span>{post.readingTime || "5"} min read</span>
          </div>
        </div>

        {post.image && (
          <>
            <div className="post-image-container" onClick={handleImageClick}>
              <img src={post.image} alt={post.title} className="post-image" />
            </div>

            {/* Image Modal */}
            <div
              className={`image-modal-overlay ${
                isImageModalOpen ? "visible" : ""
              }`}
              onClick={handleCloseModal}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
                <img
                  src={post.image}
                  alt={post.title}
                  className="modal-image"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
                <div className="zoom-controls">
                  <button
                    className="zoom-button"
                    onClick={() => handleZoom("out")}
                  >
                    −
                  </button>
                  <button
                    className="zoom-button"
                    onClick={() => handleZoom("in")}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="post-body">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <img
                src={user.profilePhoto || defaultAvatar}
                alt={user.username}
                className="user-avatar"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="submit-comment"
              disabled={!newComment.trim()}
            >
              Post Comment
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>
              <Link to="/login">Log in</Link> or{" "}
              <Link to="/register">create an account</Link> to leave a comment.
            </p>
          </div>
        )}

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <img
                    src={comment.author.profilePhoto || defaultAvatar}
                    alt={comment.author.username}
                    className="comment-avatar"
                  />
                  <div className="comment-author-info">
                    <span className="comment-author">
                      {comment.author.username}
                    </span>
                    <span className="comment-date">
                      {moment(comment.createdAt).fromNow()}
                    </span>
                  </div>
                  {user &&
                    (user._id === comment.author._id ||
                      user.role === "admin") && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="delete-comment-button"
                      >
                        Delete
                      </button>
                    )}
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
