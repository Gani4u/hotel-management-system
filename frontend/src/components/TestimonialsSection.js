import React, { useEffect, useState } from "react";
import API from "../services/api";

const renderStars = (rating) => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const fallbackTestimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    room_type: "Suite",
    rating: 5,
    title: "Wonderful luxury stay",
    review_text:
      "Exceptional service and luxurious accommodations. The staff went above and beyond to make my stay memorable.",
  },
  {
    id: 2,
    name: "Michael Chen",
    room_type: "Deluxe",
    rating: 5,
    title: "Perfect family vacation",
    review_text:
      "Beautiful rooms, clean property, and amazing hospitality. I would definitely return for another stay.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    room_type: "Double",
    rating: 5,
    title: "Great experience",
    review_text:
      "A smooth check-in, wonderful staff support, and excellent ambiance throughout the stay.",
  },
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [stats, setStats] = useState({ total_reviews: 0, average_rating: 0 });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await API.get("/reviews/public?limit=6");
      if (response.data?.data?.length) {
        setTestimonials(response.data.data);
      }
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch public reviews:", error);
    }
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="section-header">
          <h2>What Our Guests Say</h2>
          <p>Real experiences from our satisfied customers</p>

          {Number(stats.total_reviews) > 0 && (
            <div className="testimonial-summary-strip">
              <span>{stats.total_reviews}+ reviews</span>
              <span>•</span>
              <span>{stats.average_rating || 0}/5 average rating</span>
            </div>
          )}
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="testimonial-card premium-testimonial-card"
            >
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {getInitials(testimonial.name)}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <span className="testimonial-role">
                    {testimonial.room_type || "Guest"}
                  </span>
                </div>
              </div>

              <div className="testimonial-rating">
                {renderStars(Number(testimonial.rating || 0))}
              </div>

              {testimonial.title && (
                <h5 className="testimonial-title">{testimonial.title}</h5>
              )}

              <p className="testimonial-text">"{testimonial.review_text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
