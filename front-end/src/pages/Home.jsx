import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import defaultAvatar from "../assets/avatar.jpg";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const { user } = useAuth();

  // State for public posts
  const [publicPosts, setPublicPosts] = useState([]);
  const [loadingPublicPosts, setLoadingPublicPosts] = useState(true);

  // State for user's posts
  const [userPosts, setUserPosts] = useState([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(true);

  const [activeTab, setActiveTab] = useState("all-posts");

  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeletePost = async (postId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/api/posts/${postId}`);

        // update UI state after successfull deletion
        if (activeTab === "my-posts") {
          setUserPosts(userPosts.filter((post) => post._id !== postId));
        } else {
          setPublicPosts(publicPosts.filter((post) => post._id !== postId));
        }

        toast.success("Post deleted successfully");
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  // Fetch all public posts
  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const res = await api.get("/api/posts/");
        // Sort posts by creation date, newest first
        const sortedPosts = res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPublicPosts(sortedPosts);
      } catch (error) {
        console.error("Failed to fetch public posts:", error);
      } finally {
        setLoadingPublicPosts(false);
      }
    };

    fetchPublicPosts();
  }, []);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user?._id) {
        try {
          const res = await api.get(`/api/posts/user/${user._id}`);
          // Sort user posts by creation date, newest first
          const sortedPosts = res.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setUserPosts(sortedPosts);
        } catch (error) {
          console.error("Failed to fetch user's posts:", error);
        } finally {
          setLoadingUserPosts(false);
        }
      }
    };

    fetchUserPosts();
  }, [user]); // Only runs when user changes

  // VIEW FOR LOGGED IN USER'S
  if (user) {
    return (
      <div className="home-page logged-in">
        {/* Dashboard Header */}
        <section className="dashboard-header">
          <div className="welcome-message">
            <h1>Welcome back, {user.username}</h1>
            <p>You have {userPosts.length} published posts.</p>
          </div>
          <Link to="/create-post" className="new-post-button">
            + New Post
          </Link>
        </section>

        {/* Content Tabs */}
        <div className="content-tabs">
          <button
            className={`tab ${activeTab === "all-posts" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("all-posts");
            }}
          >
            ALL POSTS
          </button>
          <button
            className={`tab ${activeTab === "my-posts" ? "active" : ""}`}
            onClick={() => setActiveTab("my-posts")}
          >
            MY POSTS
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="dashboard-content">
          {/* LEFT COLUMN - POSTS LISTS */}
          <div className="posts-column">
            {activeTab === "my-posts" ? (
              <>
                {loadingUserPosts ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <div className="posts-list">
                    {userPosts.length > 0 ? (
                      userPosts.map((post) => (
                        <div key={post._id} className="post-card">
                          <div className="post-header">
                            <h3>{post.title}</h3>
                            <div className="post-actions">
                              <Link
                                to={`/edit-post/${post._id}`}
                                className="edit-button"
                              >
                                Edit
                              </Link>
                              <button
                                className="delete-button"
                                onClick={() => handleDeletePost(post._id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <span className="spinner"></span>{" "}
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="post-excerpt">
                            {post.content.substring(0, 150)}...
                          </p>
                          <br />
                          <div className="post-stats">
                            <span>Views: {post.views || 0}</span>
                            <span>Comments: {post.comments?.length || 0}</span>
                            <span>
                              Created:{" "}
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-posts">
                        <p>You haven't created any posts yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {loadingPublicPosts ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <div className="posts-list">
                    {publicPosts.length > 0 ? (
                      publicPosts.map((post) => (
                        <div key={post._id} className="post-card">
                          <div className="post-author">
                            <img
                              src={post.author.profilePhoto || defaultAvatar}
                              alt={post.author.username}
                              style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <span>
                              <b>{post.author.username}</b>
                            </span>
                          </div>
                          <h3>{post.title}</h3>
                          <br />
                          <p className="post-excerpt">
                            {post.content.substring(0, 200)}...
                          </p>
                          <div className="post-actions">
                            <Link
                              to={`/posts/${post._id}`}
                              className="read-more"
                            >
                              Read More
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-posts">
                        <p>No posts available yet</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="dashboard-sidebar">
            <div className="sidebar-section">
              <h4>Quick Stats</h4>
              <div className="stat-item">
                <span>Total Posts:</span>
                <span>{userPosts.length}</span>
              </div>
              <div className="stat-item">
                <span>Total Views:</span>
                <span>
                  {userPosts.reduce((sum, post) => sum + (post.views || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Join Our Writing Community</h1>
          <p>
            Share your stories, discover new perspectives, and connect with
            readers worldwide
          </p>
          <div className="cta-group">
            <Link to="/register" className="primary-cta">
              Get Started
            </Link>
            <Link to="/login" className="secondary-cta">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="featured-section">
        <h2>Recently Popular Stories</h2>
        {loadingPublicPosts ? (
          <div className="loading-spinner"></div>
        ) : publicPosts.length > 0 ? (
          <div className="post-grid">
            {publicPosts.map((post) => (
              <div key={post._id} className="post-card">
                <h3>{post.title}</h3>
                <p className="excerpt">
                  {post.content.substring(0, 50)}
                  {post.content.length > 50 ? "..." : ""}
                </p>
                {!user && (
                  <div className="preview-overlay">
                    <p>Sign up to read full story</p>
                    <Link to="/register" className="read-more">
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-posts">No featured posts available</p>
        )}
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <h2>Why Join Our Community?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">✍️</div>
            <h3>Share Your Voice</h3>
            <p>Publish your stories to a global audience</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">👥</div>
            <h3>Connect With Readers</h3>
            <p>Get feedback and build your audience</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔖</div>
            <h3>Save Favorites</h3>
            <p>Bookmark stories you love</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h4>10k+</h4>
            <p>Active Writers</p>
          </div>
          <div className="stat-item">
            <h4>50k+</h4>
            <p>Monthly Readers</p>
          </div>
          <div className="stat-item">
            <h4>100k+</h4>
            <p>Stories Published</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <blockquote>
          "As a new writer, I gained 500 readers in my first month!"
          <cite>- Jane D.</cite>
        </blockquote>
      </section>

      {/* Floating CTA */}
      <div className="floating-cta">
        <p>Ready to join? It only takes 30 seconds</p>
        <Link to="/register" className="cta-button">
          Create Free Account
        </Link>
      </div>
    </div>
  );
}
