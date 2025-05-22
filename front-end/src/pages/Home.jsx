import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Home() {
  const { user } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const res = await api.get("/api/posts/");
        setFeaturedPosts(res.data.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();
  }, []);

  if (user) {
    // Redirect or show different content for logged-in users
    return <div>Welcome back, {user.username}!</div>;
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
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="post-grid">
            {featuredPosts.map((post) => (
              <div key={post._id} className="post-card">
                <h3>{post.title}</h3>
                <p className="excerpt">{post.content.substring(0, 100)}...</p>
                <div className="preview-overlay">
                  <p>Sign up to read full story</p>
                  <Link to="/register" className="read-more">
                    Join Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
