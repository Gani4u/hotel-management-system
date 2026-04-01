import { useEffect, useState } from "react";
import API from "../services/api";
import StarRatingInput from "./StarRatingsInput";

const initialState = {
  rating: 0,
  title: "",
  reviewText: "",
};

export default function ReviewModal({ open, booking, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData(initialState);
      setError("");
    }
  }, [open, booking?.id]);

  if (!open || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.rating) {
      setError("Please select a rating");
      return;
    }

    if (!formData.reviewText.trim()) {
      setError("Please write your review");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/reviews", {
        bookingId: booking.id,
        rating: formData.rating,
        title: formData.title.trim(),
        reviewText: formData.reviewText.trim(),
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box review-modal-box">
        <div className="review-modal-header">
          <div>
            <h3>Rate Your Stay</h3>
            <p>
              Room {booking.room_number} • {booking.type}
            </p>
          </div>
          <button className="review-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="review-form">
          <div className="review-score-card">
            <label className="review-label">Your Rating</label>
            <StarRatingInput
              value={formData.rating}
              onChange={(rating) =>
                setFormData((prev) => ({ ...prev, rating }))
              }
            />
            <div className="review-score-text">
              {formData.rating
                ? `${formData.rating} out of 5`
                : "Tap a star to rate"}
            </div>
          </div>

          <div className="form-group">
            <label className="review-label">Review Title</label>
            <input
              type="text"
              placeholder="Example: Wonderful stay and great service"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label className="review-label">Your Review</label>
            <textarea
              rows="5"
              placeholder="Tell others about your stay, room quality, staff, cleanliness, food, etc."
              value={formData.reviewText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reviewText: e.target.value }))
              }
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-small" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-small btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
