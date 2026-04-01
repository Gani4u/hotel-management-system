import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import "../styles/pages.css";
import "../App.css";

const renderStars = (rating) => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await API.get("/reviews/admin");
      setReviews(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    const featured = reviews.filter((r) => r.is_featured).length;
    const approved = reviews.filter((r) => r.is_approved).length;
    const avg =
      total > 0
        ? (
            reviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0,
            ) / total
          ).toFixed(1)
        : "0.0";

    return { total, featured, approved, avg };
  }, [reviews]);

  const handleFeatureToggle = async (review) => {
    try {
      setActionId(review.id);
      await API.patch(`/reviews/${review.id}/feature`, {
        isFeatured: !review.is_featured,
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? { ...item, is_featured: review.is_featured ? 0 : 1 }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update feature status",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleApprovalToggle = async (review) => {
    try {
      setActionId(review.id);
      await API.patch(`/reviews/${review.id}/approval`, {
        isApproved: !review.is_approved,
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? { ...item, is_approved: review.is_approved ? 0 : 1 }
            : item,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update visibility");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Guest Reviews</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="review-stats-grid">
        <div className="review-stat-card">
          <span>Total Reviews</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="review-stat-card">
          <span>Average Rating</span>
          <strong>{stats.avg} / 5</strong>
        </div>
        <div className="review-stat-card">
          <span>Approved</span>
          <strong>{stats.approved}</strong>
        </div>
        <div className="review-stat-card">
          <span>Featured</span>
          <strong>{stats.featured}</strong>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="coming-soon">
          <p>No reviews submitted yet.</p>
        </div>
      ) : (
        <div className="admin-review-grid">
          {reviews.map((review) => (
            <div key={review.id} className="admin-review-card">
              <div className="admin-review-top">
                <div>
                  <h3>{review.customer_name}</h3>
                  <p>
                    Room {review.room_number} • {review.room_type} • Booking #
                    {review.booking_id}
                  </p>
                </div>
                <div className="admin-review-stars">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className="admin-review-badges">
                <span
                  className={`admin-badge ${
                    review.is_approved ? "approved" : "hidden"
                  }`}
                >
                  {review.is_approved ? "Approved" : "Hidden"}
                </span>
                <span
                  className={`admin-badge ${
                    review.is_featured ? "featured" : "normal"
                  }`}
                >
                  {review.is_featured ? "Featured" : "Standard"}
                </span>
              </div>

              {review.title && (
                <h4 className="admin-review-title">{review.title}</h4>
              )}

              <p className="admin-review-text">{review.review_text}</p>

              <div className="admin-review-footer">
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                <span>{review.customer_email}</span>
              </div>

              <div className="admin-review-actions">
                <button
                  className="btn-small btn-primary"
                  disabled={actionId === review.id}
                  onClick={() => handleFeatureToggle(review)}
                >
                  {review.is_featured ? "Remove Feature" : "Feature Review"}
                </button>

                <button
                  className="btn-small btn-danger"
                  disabled={actionId === review.id}
                  onClick={() => handleApprovalToggle(review)}
                >
                  {review.is_approved ? "Hide Review" : "Approve Review"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
